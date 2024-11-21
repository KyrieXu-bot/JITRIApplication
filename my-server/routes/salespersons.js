const express = require('express');
const router = express.Router();
const db = require('../dbConfig/database');

router.get('/', async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        const departmentId = 4; // Sales department ID
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
        await connection.rollback();
    } finally {
        connection.release();
    }
});

module.exports = router;
