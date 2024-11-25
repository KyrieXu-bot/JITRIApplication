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

        // Insert payment data into payments table
        const paymentData = {
            payer_name: customerData.payer_name,
            payer_address: customerData.payer_address,
            payer_phone_num: customerData.payer_phone_num,
            bank_name: customerData.bank_name,
            tax_number: customerData.tax_number,
            bank_account: customerData.bank_account,
            payer_contact_name: customerData.payer_contact_name,
            payer_contact_phone_num: customerData.payer_contact_phone_num,
            payer_contact_email: customerData.payer_contact_email
        };
        const paymentId = await db.insertPayment(paymentData);

        res.status(201).json({ message: `委托方和付款方信息新增成功!\n客户id:${customerId}, 付款方id:${paymentId}`});
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;