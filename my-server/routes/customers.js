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


module.exports = router;