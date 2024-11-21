const express = require('express');
const router = express.Router();
const db = require('../dbConfig/database');

router.post('/', async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();
        const { customerInfo, orderInfo, paymentInfo, reportInfo, sampleInfo, testItems, assignmentInfo } = req.body;

        // Insert customer information
        const [customer] = await connection.execute(`
            INSERT INTO customers (customer_name, customer_address, contact_name, contact_phone_num, contact_email)
            VALUES (?, ?, ?, ?, ?)
        `, [customerInfo.customer_name || null, customerInfo.customer_address || null, customerInfo.contact_name || null, customerInfo.contact_phone_num || null, customerInfo.contact_email || null]);
        const customerId = customer.insertId;

        // Generate order number if not provided
        let orderNum = orderInfo.order_num;
        if (!orderNum || orderNum.trim() === '') {
            orderNum = await db.generateOrderNum();
        }

        // Insert payment information
        const [payment] = await connection.execute(`
            INSERT INTO payments (vat_type, payer_name, payer_address, payer_phone_num, bank_name, tax_number, bank_account, payer_contact_name, payer_contact_phone_num, payer_contact_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [paymentInfo.vat_type || null, paymentInfo.payer_name || null, paymentInfo.payer_address || null, paymentInfo.payer_phone_num || null, paymentInfo.bank_name || null, paymentInfo.tax_number || null, paymentInfo.bank_account || null, paymentInfo.payer_contact_name || null, paymentInfo.payer_contact_phone_num || null, paymentInfo.payer_contact_email || null]);
        const paymentId = payment.insertId;

        // Insert order information
        const [order] = await connection.execute(`
            INSERT INTO orders (customer_id, create_time, service_type, sample_shipping_address, total_price, payment_id, order_num)
            VALUES (?, NOW(), ?, ?, ?, ?, ?)
        `, [customerId || null, orderInfo.service_type || null, orderInfo.sample_shipping_address || null, orderInfo.total_price || null, paymentId || null, orderNum]);
        const orderId = order.insertId;

        // Insert sample information
        await connection.execute(`
            INSERT INTO samples (order_num, sample_name, material, product_no, material_spec, sample_solution_type, sample_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [orderNum, sampleInfo.sample_name || null, sampleInfo.material || null, sampleInfo.product_no || null, sampleInfo.material_spec || null, sampleInfo.sample_solution_type || null, sampleInfo.sample_type || null]);

        // Insert test items
        for (let item of testItems) {
            const [testItem] = await connection.execute(`
                INSERT INTO test_items (order_num, create_time, original_no, test_item, test_method, size, quantity, note, status, department_id, deadline)
                VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, '0', ?, ?)
            `, [orderNum, item.original_no || null, item.test_item || null, item.test_method || null, item.size || null, item.quantity || null, item.note || null, item.department_id || null, item.deadline || null]);
            const testItemId = testItem.insertId;

            // Insert assignment
            await connection.execute(`
                INSERT INTO assignments (test_item_id, account)
                VALUES (?, ?)
            `, [testItemId, assignmentInfo.account]);
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