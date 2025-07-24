const express = require('express');
const router = express.Router();
const db = require('../dbConfig/database');

router.get('/', async (req, res) => {
    try {
        const {searchTestItem, searchTestCondition, searchTestCode} = req.query;
        const results = await db.getPrices(searchTestItem, searchTestCondition, searchTestCode);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
});

module.exports = router;