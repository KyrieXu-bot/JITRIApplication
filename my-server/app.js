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
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        const { customerInfo, orderInfo, paymentInfo, reportInfo, sampleInfo, testItems, department_id} = req.body;

        // 插入客户信息
        const [customer] = await connection.execute(`
            INSERT INTO customers (customer_name, customer_address, contact_name, contact_phone_num, contact_email) 
            VALUES (?, ?, ?, ?, ?)
        `, [customerInfo.customer_name, customerInfo.customer_address, customerInfo.contact_name, customerInfo.contact_phone_num, customerInfo.contact_email]);
        const customerId = customer.insertId;
        // Generate order code
        const orderNum = await db.generateOrderNum();

        // 插入支付信息
        const [payment] = await connection.execute(`
            INSERT INTO payments (vat_type, payer_name, payer_address, payer_phone_num, bank_name, tax_number, bank_account, payer_contact_name, payer_contact_phone_num, payer_contact_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [paymentInfo.vat_type, paymentInfo.payer_name, paymentInfo.payer_address, paymentInfo.payer_phone_num, paymentInfo.bank_name, paymentInfo.tax_number, paymentInfo.bank_account, paymentInfo.payer_contact_name, paymentInfo.payer_contact_phone_num, paymentInfo.payer_contact_email]);
        const paymentId = payment.insertId;

        // 插入订单信息
        const [order] = await connection.execute(`
            INSERT INTO orders (customer_id, create_time, service_type, sample_shipping_address, payment_id, order_num)
            VALUES (?, NOW(), ?, ?, ?, ?)
        `, [customerId, orderInfo.service_type, orderInfo.sample_shipping_address, paymentId, orderNum]);
        const orderId = order.insertId;

        // 插入样品信息，现在直接关联到订单
        await connection.execute(`
            INSERT INTO samples (order_num, sample_name, material, product_no, material_spec, sample_solution_type, sample_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [orderNum, sampleInfo.sample_name, sampleInfo.material, sampleInfo.product_no, sampleInfo.material_spec, sampleInfo.sample_solution_type, sampleInfo.sample_type]);

        for (let item of testItems) {
            console.log(item.department_id)
            await connection.execute(`
                INSERT INTO test_items (order_num, original_no, test_item, test_method, size, quantity, note, status, department_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, '0', ?)
            `, [orderNum, item.original_no, item.test_item, item.test_method, item.size, item.quantity, item.note, item.department_id]);

        }

        // 插入报告信息
        await connection.execute(`
            INSERT INTO reports (order_num, type, paper_report_shipping_type, report_additional_info)
            VALUES (?, ?, ?, ?)
        `, [orderNum, reportInfo.type, reportInfo.paper_report_shipping_type, reportInfo.report_additional_info]);

        await connection.commit();
        res.status(201).send({ message: 'Commission created successfully', commissionId: orderId, orderNum: orderNum });
    } catch (error) {
        await connection.rollback();
        res.status(500).send({ message: 'Error creating commission', error: error.message });
    } finally {
        connection.release();
    }
});