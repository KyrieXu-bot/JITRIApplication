const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'jitri',
    database: 'jitri'
});

async function generateOrderNum() {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(`
            SELECT CONCAT('JC', DATE_FORMAT(NOW(), '%y%m'), LPAD(IFNULL(MAX(RIGHT(order_num, 3)), 0) + 1, 3, '0')) AS newOrderNum
            FROM orders
            WHERE order_num LIKE CONCAT('JC', DATE_FORMAT(NOW(), '%y%m'), '%')
        `);
        return rows[0].newOrderNum;
    } finally {
        connection.release();
    }
}

module.exports = {pool, generateOrderNum};
