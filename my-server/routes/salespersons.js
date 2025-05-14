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

router.post('/sales-info', async (req, res) => {
    const connection = await db.pool.getConnection();
    try {
      const { account } = req.body;
      const query = `
        SELECT user_email, user_phone_num
        FROM users
        WHERE account = ?;
      `;
      const [rows] = await connection.query(query, [account]);
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Salesperson not found' });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error('Failed to fetch salesperson contact info:', error);
      res.status(500).json({ message: 'Failed to fetch contact info', error: error.message });
    } finally {
      connection.release();
    }
  });

  
module.exports = router;
