const express = require('express');
const router = express.Router();
const db = require('../dbConfig/database');

router.post('/', async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();
        console.log(req.body)

        const {
            customerId,
            vatType,
            orderInfo,
            paymentId,
            reportInfo,
            sampleHandling,
            sampleRequirements,
            testItems,
            assignmentInfo
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
                INSERT INTO orders (customer_id, create_time, service_type, sample_shipping_address, total_price, payment_id, order_num, vat_type, order_status)
                VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, '0')
            `, [customerId || null, orderInfo.service_type || null, orderInfo.sample_shipping_address || null, orderInfo.total_price || null, paymentId || null, orderNum, vatType]);
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
                sampleRequirements.hazardOther   || null,
                sampleRequirements.magnetism     || null,
                sampleRequirements.conductivity  || null,
                sampleRequirements.breakable     || null,
                sampleRequirements.brittle       || null
            ]);
        }
        // Insert test items
        for (let item of testItems) {
            const [ti] = await connection.execute(
              `INSERT INTO test_items 
                 (order_num, create_time, original_no, test_item, test_method,
                  size, quantity, note, status, department_id, deadline, price_id,
                  sample_name, material, sample_type, sample_preparation)
               VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, '0', ?, ?, ?, ?, ?, ?, ?)`,
              [
                orderNum,
                item.original_no || null,
                item.test_item || null,
                item.test_method || null,
                item.size || null,
                item.quantity || null,
                item.note || null,
                item.department_id || null,
                item.deadline || null,
                item.price_id || null,
                // 新增这四列，需先在表结构里添加
                item.sample_name || null,
                item.material || null,
                item.sample_type || null,
                item.sample_preparation || null
              ]
            );
            const testItemId = ti.insertId;
            await connection.execute(
              `INSERT INTO assignments 
                 (test_item_id, account, is_assigned)
               VALUES (?, ?, 0)`,
              [testItemId, assignmentInfo.account]
            );
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
            reportInfo.report_additional_info   || null,
            reportInfo.header_type              || null,
            reportInfo.header_other             || null,
            reportInfo.format_type              || null
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

module.exports = router;