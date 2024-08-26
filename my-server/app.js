const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();

app.use(cors());  // 允许跨域请求
app.use(express.json());  // 用于解析 JSON 格式的请求体

// 简单的路由来测试服务器
app.get('/', (req, res) => {
    res.send('Hello from the server!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



app.get('/customers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM customers');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/commission', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { customerInfo, orderInfo, paymentInfo, reportInfo, samples, testItems } = req.body;
        console.log(testItems);

        // 插入支付信息
        const [payment] = await connection.execute(`
            INSERT INTO payments (vat_type, payer_name, payer_address, payer_phone_num, bank_name, tax_number, bank_account, payer_contact_name, payer_contact_phone_num, payer_contact_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [paymentInfo.vat_type, paymentInfo.payer_name, paymentInfo.payer_address, paymentInfo.payer_phone_num, paymentInfo.bank_name, paymentInfo.tax_number, paymentInfo.bank_account, paymentInfo.payer_contact_name, paymentInfo.payer_contact_phone_num, paymentInfo.payer_contact_email]);
        const paymentId = payment.insertId;

        // 插入客户信息
        const [customer] = await connection.execute(`
            INSERT INTO customers (customer_name, customer_address, contact_name, contact_phone_num, contact_email, payment_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [customerInfo.customer_name, customerInfo.customer_address, customerInfo.contact_name, customerInfo.contact_phone_num, customerInfo.contact_email, paymentId]);
        const customerId = customer.insertId;

        // 插入订单信息
        const [order] = await connection.execute(`
            INSERT INTO orders (customer_id, create_time, service_type, sample_shipping_address, payment_id)
            VALUES (?, NOW(), ?, ?, ?)
        `, [customerId, orderInfo.service_type, orderInfo.sample_shipping_address, paymentId]);
        const orderId = order.insertId;

        // // 处理测试项目和样品
        // for (let item of testItems) {
        //     const [testItem] = await connection.execute(`
        //         INSERT INTO test_items (order_id, original_no, test_item, test_method, size, quantity, note)
        //         VALUES (?, ?, ?, ?, ?, ?, ?)
        //     `, [orderId, item.original_no, item.test_item, item.test_method, item.size, item.quantity, item.note]);
        //     const testItemId = testItem.insertId;

        //     // 对应每个测试项插入样品
        //     const correspondingSample = samples.find(sample => sample.test_item_id === item.test_item_id);
        //     if (correspondingSample) {
        //         await connection.execute(`
        //             INSERT INTO samples (test_item_id, sample_name, material, product_no, material_spec, sample_solution_type, sample_type)
        //             VALUES (?, ?, ?, ?, ?, ?, ?)
        //         `, [testItemId, correspondingSample.sample_name, correspondingSample.material, correspondingSample.product_no, correspondingSample.material_spec, correspondingSample.sample_solution_type, correspondingSample.sample_type]);
        //     }
        // }


        for (let item of testItems) {
            const [testItem] = await connection.execute(`
                INSERT INTO test_items (order_id, original_no, test_item, test_method, size, quantity, note)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [orderId, item.original_no, item.test_item, item.test_method, item.size, item.quantity, item.note]);
            const testItemId = testItem.insertId;

            // 插入样品信息
            await connection.execute(`
                INSERT INTO samples (test_item_id, sample_name, material, product_no, material_spec, sample_solution_type, sample_type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [testItemId, samples.sample_name, samples.material, samples.product_no, samples.material_spec, samples.sample_solution_type, samples.sample_type]);
        }

        // 插入报告信息
        await connection.execute(`
            INSERT INTO reports (order_id, type, paper_report_shipping_type, report_additional_info)
            VALUES (?, ?, ?, ?)
        `, [orderId, reportInfo.type, reportInfo.paper_report_shipping_type, reportInfo.report_additional_info]);

        await connection.commit();
        res.status(201).send({ message: 'Commission created successfully', commissionId: orderId });
    } catch (error) {
        await connection.rollback();
        res.status(500).send({ message: 'Error creating commission', error: error.message });
    } finally {
        connection.release();
    }
});