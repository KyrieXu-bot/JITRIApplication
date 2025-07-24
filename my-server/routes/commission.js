const express = require('express');
const router = express.Router();
const db = require('../dbConfig/database');

router.post('/', async (req, res) => {
  const connection = await db.pool.getConnection();
  try {
    await connection.beginTransaction();
    const {
      customerId,
      vatType,
      orderInfo,
      paymentId,
      reportInfo,
      sampleHandling,
      sampleRequirements,
      testItems,
      assignmentInfo,
    } = req.body;

    // Generate order number if not provided
    let orderNum = orderInfo.order_num;
    if (!orderNum || orderNum.trim() === '') {
      orderNum = await db.generateOrderNum();
    }

    // Check if orderNum already exists
    const [existingOrder] = await connection.execute(`
            SELECT order_id FROM orders WHERE order_num = ?
        `, [orderNum]);

    let orderId;
    if (existingOrder.length > 0) {
      // orderNum exists: retrieve orderId
      return res.status(400).send({ message: '该委托单号已存在，请检查您的输入或留空以自动生成一个新的委托单号。' });
      // orderId = existingOrder[0].id;
    } else {
      // Insert order information
      const [order] = await connection.execute(`
                INSERT INTO orders (customer_id, create_time, service_type, sample_shipping_address, total_price, payment_id, order_num, vat_type, delivery_days_after_receipt, report_seals, order_status, other_requirements)
                VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, '0', ?)
            `, [customerId || null,
      orderInfo.service_type || null,
      orderInfo.sample_shipping_address || null,
      orderInfo.total_price || null,
      paymentId || null,
        orderNum,
        vatType,
      orderInfo.delivery_days_after_receipt ?? null,
      Array.isArray(orderInfo.report_seals)
        ? JSON.stringify(orderInfo.report_seals)
        : null,
        orderInfo.other_requirements ?? null
      ]);
      orderId = order.insertId;

      // Insert only “样品处置”到 samples.sample_solution_type
      await connection.execute(`
                INSERT INTO samples (
                  order_num,
                  sample_solution_type,
                  hazards,
                  hazard_other,
                  magnetism,
                  conductivity,
                  breakable,
                  brittle
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `, [
        orderNum,
        sampleHandling.handling_type || null,

        // —— 下面是 sampleRequirements ——  
        JSON.stringify(sampleRequirements.hazards || []),     // 如果用 JSON 列
        sampleRequirements.hazardOther || null,
        sampleRequirements.magnetism || null,
        sampleRequirements.conductivity || null,
        sampleRequirements.breakable || null,
        sampleRequirements.brittle || null
      ]);
    }


    // Insert test items
    for (let item of testItems) {
      let status = 0;
      const [ti] = await connection.execute(
        `INSERT INTO test_items 
                 (order_num, create_time, original_no, test_item, test_method,
                  quantity, note, price_note, status, department_id, deadline, price_id,
                  sample_name, material, sample_type, sample_preparation)
               VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNum,
          item.original_no ?? null,
          item.test_item ?? null,
          item.test_method ?? null,
          item.quantity ?? null,
          item.note ?? null,
          item.price_note ?? null,
          status,
          item.department_id ?? null,
          item.deadline ?? null,
          item.price_id ?? null,
          // 新增这四列，需先在表结构里添加
          item.sample_name ?? null,
          item.material ?? null,
          item.sample_type ?? null,
          item.sample_preparation ?? null
        ]
      );
      const testItemId = ti.insertId;
      await connection.execute(
        `INSERT INTO assignments 
                 (test_item_id, account, is_assigned)
               VALUES (?, ?, 0)`,
        [testItemId, assignmentInfo.account]
      );

      // 额外处理：是否直接分配给组长？
      const [[priceInfo]] = await connection.execute(
        `SELECT group_id, test_condition FROM price WHERE test_code = ?`,
        [item.test_code || null]
      );
      if (priceInfo && priceInfo.group_id && priceInfo.test_condition !== '其他') {
        const [[leader]] = await connection.execute(
          `SELECT account FROM users WHERE role = 'supervisor' AND group_id = ? LIMIT 1`,
          [priceInfo.group_id]
        );
        if (leader) {
          await connection.execute(`
          INSERT INTO assignments (test_item_id, account, is_assigned)
          VALUES (?, ?, 0)
          `, [testItemId, leader.account]);

          // 更新 test_items 的 status 为 1
          await connection.execute(
            `UPDATE test_items SET status = 1, assign_time = NOW() WHERE test_item_id = ?`,
            [testItemId]
          );
        }
      }
    }

    // Insert report information
    await connection.execute(`
            INSERT INTO reports (
              order_num,
              \`type\`,
              paper_report_shipping_type,
              report_additional_info,
              header_type,
              header_other,
              format_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
      orderNum,
      // 如果你希望存数组，请先 JSON.stringify；或存逗号分隔：
      Array.isArray(reportInfo.type) ? JSON.stringify(reportInfo.type) : reportInfo.type,
      reportInfo.paper_report_shipping_type || null,
      reportInfo.report_additional_info || null,
      reportInfo.header_type || null,
      reportInfo.header_other || null,
      reportInfo.format_type || null
    ]);

    await connection.commit();
    res.status(201).send({ message: 'Commission created successfully', commissionId: orderId, orderNum: orderNum });
  } catch (error) {
    await connection.rollback();
    res.status(500).send({ message: 'Error creating commission', error: error.message });
  } finally {
    connection.release();
  }
});

// routes/commission.js（末尾追加）
router.get('/:orderNum', async (req, res) => {
  const { orderNum } = req.params;
  const connection = await db.pool.getConnection();
  try {
    // 1) 查 orders
    const [orders] = await connection.execute(
      `SELECT o.*, c.customer_name, c.contact_name, c.customer_address, c.contact_phone_num, c.contact_email,
      p.payer_name, p.payer_address, p.payer_phone_num, p.payer_contact_name, p.payer_contact_phone_num, p.bank_name, p.tax_number, p.bank_account
         FROM orders o
         LEFT JOIN customers c ON o.customer_id = c.customer_id
         LEFT JOIN payments p ON o.payment_id = p.payment_id
        WHERE o.order_num = ?`,
      [orderNum]
    );
    if (orders.length === 0) return res.status(404).send({ message: '找不到该委托单' });
    const order = orders[0];

    // 2) 查 samples（样品处置）
    const [samples] = await connection.execute(
      `SELECT sample_solution_type FROM samples WHERE order_num = ?`,
      [orderNum]
    );

    // 3) 查 reports
    const [reports] = await connection.execute(
      `SELECT type, paper_report_shipping_type, report_additional_info,
              header_type, header_other, format_type
         FROM reports WHERE order_num = ?`,
      [orderNum]
    );

    // 4) 查 test_items + assignments + payer info
    const [items] = await connection.execute(
      `SELECT ti.*, GROUP_CONCAT(a.account) AS accounts,
      p.test_code,
      p.test_standard,
      p.group_id
         FROM test_items ti
         LEFT JOIN assignments a ON ti.test_item_id = a.test_item_id
         LEFT JOIN price p ON ti.price_id = p.price_id
        WHERE ti.order_num = ?
        GROUP BY ti.test_item_id`,
      [orderNum]
    );

    // 5) 查 sample_requirements 存到一个表 sample_requirements （如果你后来把这一块存进了 DB）
    const [reqs] = await connection.execute(
      `SELECT hazards, hazard_other, magnetism, conductivity, breakable, brittle
         FROM samples 
        WHERE order_num = ?`,
      [orderNum]
    );

    res.send({
      customer: {
        customer_id: order.customer_id,
        customer_name: order.customer_name,
        contact_name: order.contact_name,
        customer_address: order.customer_address,
        contact_phone_num: order.contact_phone_num,
        contact_email: order.contact_email,
      },
      payer: {
        payment_id: order.payment_id,
        payer_name: order.payer_name,
        payer_phone_num: order.payer_phone_num,
        payer_address: order.payer_address,
        payer_contact_name: order.payer_contact_name,
        payer_contact_phone_num: order.payer_contact_phone_num,
        bank_name: order.bank_name,
        tax_number: order.tax_number,
        bank_account: order.bank_account,
      },
      orderInfo: {
        service_type: order.service_type,
        sample_shipping_address: order.sample_shipping_address,
        total_price: order.total_price,
        order_num: order.order_num,
        other_requirements: order.other_requirements,
        subcontracting_not_accepted: !!order.subcontracting_not_accepted,
        delivery_days_after_receipt: order.delivery_days_after_receipt,
        report_seals: order.report_seals
      },
      vatType: order.vat_type,
      reportInfo: reports[0] || {},
      sampleHandling: {
        handling_type: samples[0]?.sample_solution_type,
        // 如果有更多 return_info 存表，也一起查出来并附上
      },
      sampleRequirements: reqs[0] || {},
      testItems: items.map(ti => ({
        test_item_id: ti.test_item_id,
        original_no: ti.original_no,
        test_item: ti.test_item,
        test_method: ti.test_method,
        size: ti.size,
        quantity: ti.quantity,
        note: ti.note,
        department_id: ti.department_id,
        deadline: ti.deadline,
        price_id: ti.price_id,
        sample_name: ti.sample_name,
        material: ti.material,
        sample_type: ti.sample_type,
        sample_preparation: ti.sample_preparation,
        assignment_accounts: ti.accounts ? ti.accounts.split(',') : [],
        test_code: ti.test_code,
        test_standard: ti.test_standard,
        group_id: ti.group_id,
        price_note: ti.price_note
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: '查询失败', error: e.message });
  } finally {
    connection.release();
  }
});


module.exports = router;