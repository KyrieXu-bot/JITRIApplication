const express = require('express');
const router = express.Router();
const db = require('../dbConfig/database');

router.get('/', async (req, res) => {
    try {
        const {searchNameTerm, searchContactNameTerm, searchContactPhoneTerm} = req.query;
        const results = await db.getCustomers(searchNameTerm, searchContactNameTerm, searchContactPhoneTerm);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/create', async (req, res) => {
    try {
        const customerData = req.body;
        // Insert customer data into customers table
        const customerId = await db.insertCustomer(customerData);
        res.status(201).json({ message: `委托方信息新增成功!\n客户id:${customerId}`});
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 检查手机号是否存在
router.post('/check-phone', async (req, res) => {
    const { contactPhoneNum } = req.body;

    try {
        const [result] = await db.pool.query('SELECT COUNT(*) FROM customers WHERE contact_phone_num = ?', [contactPhoneNum]);
        if (result[0]['COUNT(*)'] > 0) {
            return res.json({ exists: true });
        }
        return res.json({ exists: false });
    } catch (error) {
        console.error('数据库查询失败:', error);
        return res.status(500).json({ error: '数据库错误' });
    }
});

module.exports = router;