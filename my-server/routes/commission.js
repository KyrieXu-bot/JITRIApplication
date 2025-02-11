const express = require('express');
const router = express.Router();
const db = require('../dbConfig/database');

router.post('/', async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();
        const { customerId, vatType, orderInfo, paymentId, reportInfo, sampleInfo, testItems, assignmentInfo } = req.body;

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
            orderId = existingOrder[0].id;
        } else {
            // Insert order information
            const [order] = await connection.execute(`
                INSERT INTO orders (customer_id, create_time, service_type, sample_shipping_address, total_price, payment_id, order_num, vat_type, order_status)
                VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, '0')
            `, [customerId || null, orderInfo.service_type || null, orderInfo.sample_shipping_address || null, orderInfo.total_price || null, paymentId || null, orderNum, vatType]);
            orderId = order.insertId;

            // Insert sample information
            await connection.execute(`
                INSERT INTO samples (order_num, sample_name, material, product_no, material_spec, sample_solution_type, sample_type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [orderNum, sampleInfo.sample_name || null, sampleInfo.material || null, sampleInfo.product_no || null, sampleInfo.material_spec || null, sampleInfo.sample_solution_type || null, sampleInfo.sample_type || null]);
        }
        // Insert test items
        for (let item of testItems) {
            const [testItem] = await connection.execute(`
                INSERT INTO test_items (order_num, create_time, original_no, test_item, test_method, size, quantity, note, status, department_id, deadline)
                VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, '0', ?, ?)
            `, [orderNum, item.original_no || null, item.test_item || null, item.test_method || null, item.size || null, item.quantity || null, item.note || null, item.department_id || null, item.deadline || null]);
            const testItemId = testItem.insertId;

            // Insert assignment
            await connection.execute(`
                INSERT INTO assignments (test_item_id, account, is_assigned)
                VALUES (?, ?, ?)
            `, [testItemId, assignmentInfo.account, 0]);
        }
    
        // Insert report information
        await connection.execute(`
            INSERT INTO reports (order_num, type, paper_report_shipping_type, report_additional_info)
            VALUES (?, ?, ?, ?)
        `, [orderNum, reportInfo.type || null, reportInfo.paper_report_shipping_type || null, reportInfo.report_additional_info || null]);

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