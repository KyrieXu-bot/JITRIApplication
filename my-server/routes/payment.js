const express = require('express');
const router = express.Router();
const db = require('../dbConfig/database');

router.get('/', async (req, res) => {
    try {
        const {searchNameTerm, searchContactNameTerm, searchContactPhoneTerm} = req.query;
        const results = await db.getPayers(searchNameTerm, searchContactNameTerm, searchContactPhoneTerm);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
});

router.get('/group', async (req, res) => {
    try {
        const {searchNameTerm} = req.query;
        const results = await db.getPayersGroup(searchNameTerm);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
});

router.post('/create', async (req, res) => {
    try {
        const paymentData = req.body;
        const paymentId = await db.insertPayment(paymentData);

        res.status(201).json({ message: `付款方信息新增成功!\n付款方id:${paymentId}`});
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



router.get('/prefill', async (req, res) => {
    try {
        const {customerId} = req.query;
        const result = await db.queryPayment(customerId);
        res.status(201).json(result);
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 检查手机号是否存在
router.post('/check-phone', async (req, res) => {
    const { payerContactPhoneNum, payerName } = req.body;

    try {
        const [result] = await db.pool.query('SELECT COUNT(*) FROM payments WHERE payer_contact_phone_num = ? AND payer_name = ?', [payerContactPhoneNum, payerName]);
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