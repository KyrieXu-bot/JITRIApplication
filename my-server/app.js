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

        const { customerInfo, orderInfo, paymentInfo, reportInfo, sampleInfo, testItems, assignmentInfo } = req.body;

        // 插入客户信息
        const [customer] = await connection.execute(`
            INSERT INTO customers (customer_name, customer_address, contact_name, contact_phone_num, contact_email) 
            VALUES (?, ?, ?, ?, ?)
        `, [customerInfo.customer_name || null,
        customerInfo.customer_address || null,
        customerInfo.contact_name || null,
        customerInfo.contact_phone_num || null,
        customerInfo.contact_email || null]);
        const customerId = customer.insertId;
        // Generate order code
        const orderNum = await db.generateOrderNum();

        // 插入支付信息
        const [payment] = await connection.execute(`
            INSERT INTO payments (vat_type, payer_name, payer_address, payer_phone_num, bank_name, tax_number, bank_account, payer_contact_name, payer_contact_phone_num, payer_contact_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [paymentInfo.vat_type || null,
        paymentInfo.payer_name || null,
        paymentInfo.payer_address || null,
        paymentInfo.payer_phone_num || null,
        paymentInfo.bank_name || null,
        paymentInfo.tax_number || null,
        paymentInfo.bank_account || null,
        paymentInfo.payer_contact_name || null,
        paymentInfo.payer_contact_phone_num || null,
        paymentInfo.payer_contact_email || null]);
        const paymentId = payment.insertId;

        // 插入订单信息
        const [order] = await connection.execute(`
            INSERT INTO orders (customer_id, create_time, service_type, sample_shipping_address, total_price, payment_id, order_num)
            VALUES (?, NOW(), ?, ?, ?, ?, ?)
        `, [customerId || null,
        orderInfo.service_type || null,
        orderInfo.sample_shipping_address || null,
        orderInfo.total_price || null,
        paymentId || null, orderNum]);
        const orderId = order.insertId;

        // 插入样品信息，现在直接关联到订单
        await connection.execute(`
            INSERT INTO samples (order_num, sample_name, material, product_no, material_spec, sample_solution_type, sample_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [orderNum, sampleInfo.sample_name || null,
            sampleInfo.material || null,
            sampleInfo.product_no || null,
            sampleInfo.material_spec || null,
            sampleInfo.sample_solution_type || null,
            sampleInfo.sample_type || null]);

        for (let item of testItems) {
            const [testItem] = await connection.execute(`
                INSERT INTO test_items (order_num, create_time, original_no, test_item, test_method, size, quantity, note, status, department_id)
                VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, '0', ?)
            `, [orderNum, item.original_no || null,
                item.test_item || null,
                item.test_method || null,
                item.size || null, item.quantity || null, item.note || null, item.department_id || null]);

            const testItemId = testItem.insertId;

            // 插入销售人员与测试项目的关联
            await connection.execute(`
                INSERT INTO assignments (test_item_id, account)
                VALUES (?, ?)
            `, [testItemId, assignmentInfo.account]);
        }

        // 插入报告信息
        await connection.execute(`
            INSERT INTO reports (order_num, type, paper_report_shipping_type, report_additional_info)
            VALUES (?, ?, ?, ?)
        `, [orderNum, reportInfo.type || null,
            reportInfo.paper_report_shipping_type || null,
            reportInfo.report_additional_info || null]);


        await connection.commit();
        res.status(201).send({ message: 'Commission created successfully', commissionId: orderId, orderNum: orderNum });
    } catch (error) {
        await connection.rollback();
        res.status(500).send({ message: 'Error creating commission', error: error.message });
    } finally {
        connection.release();
    }
});


// 在app.js中添加新的路由
app.get('/prefill-payment-info', async (req, res) => {
    const phoneNumber = req.query.phoneNumber;

    if (!phoneNumber) {
        return res.status(400).json({ error: '手机号不能为空' });
    }

    try {
        const connection = await db.pool.getConnection();
        try {
            // 查询 customer_id
            const [customers] = await connection.query('SELECT customer_id FROM customers WHERE contact_phone_num = ?', [phoneNumber]);
            if (customers.length === 0) {
                return res.status(404).json({ error: '未查询到对应的客户信息' });
            }
            const customerId = customers[0].customer_id;

            // 查询 payment_id
            const [payments] = await connection.query('SELECT payment_id FROM orders WHERE customer_id = ?', [customerId]); if (payments.length === 0) {
                return res.status(404).json({ error: '未查询到对应的付款方信息' });
            }

            // 获取支付信息（假设存在一个 payment_details 表）
            const paymentId = payments[0].payment_id;
            const [paymentDetails] = await connection.query('SELECT * FROM payments WHERE payment_id = ?', [paymentId]);
            if (paymentDetails.length === 0) {
                return res.status(404).json({ error: '未查询到付款方详细信息' });
            }

            res.json(paymentDetails[0]);
        } finally {
            connection.release();
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 获取销售人员信息
app.get('/salespersons', async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        const departmentId = 4; // 销售部门的ID
        const query = `
            SELECT account, name 
            FROM users 
            WHERE department_id = ?;
        `;
        const [salespersons] = await connection.query(query, [departmentId]);
        res.json(salespersons);
    } catch (error) {
        console.error('Failed to fetch salespersons:', error);
        res.status(500).send({ message: 'Failed to fetch data', error: error.message });
    }
});

