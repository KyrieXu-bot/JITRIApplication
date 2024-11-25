const express = require('express');
const router = express.Router();
const db = require('../dbConfig/database');

router.get('/', async (req, res) => {
    // const customerName = req.query.customerName;
    // if (!customerName) {
    //     return res.status(400).json({ error: '公司/单位不能为空' });
    // }

    // try {
    //     const connection = await db.pool.getConnection();
    //     try {
    //         await connection.beginTransaction();

    //         // Query customer_id
    //         const [customers] = await connection.query('SELECT customer_id FROM customers WHERE customer_name = ?', [customerName]);
    //         if (customers.length === 0) {
    //             return res.status(404).json({ error: '未查询到对应的客户信息' });
    //         }
    //         const customerId = customers[0].customer_id;

    //         // Query payment_id
    //         const [payments] = await connection.query('SELECT payment_id FROM orders WHERE customer_id = ?', [customerId]);
    //         if (payments.length === 0) {
    //             return res.status(404).json({ error: '未查询到对应的付款方信息' });
    //         }

    //         // Get payment details
    //         const paymentId = payments[0].payment_id;
    //         const [paymentDetails] = await connection.query('SELECT * FROM payments WHERE payment_id = ?', [paymentId]);
    //         if (paymentDetails.length === 0) {
    //             return res.status(404).json({ error: '未查询到付款方详细信息' });
    //         }

    //         res.json(paymentDetails[0]);
    //         await connection.commit();
    //     } catch (error) {
    //         await connection.rollback();
    //         throw error;
    //     } finally {
    //         connection.release();
    //     }
    // } catch (err) {
    //     res.status(500).json({ error: err.message });
    // }

    try {
        const {searchNameTerm, searchContactNameTerm, searchContactPhoneTerm} = req.query;
        const results = await db.getPayers(searchNameTerm, searchContactNameTerm, searchContactPhoneTerm);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
});

module.exports = router;