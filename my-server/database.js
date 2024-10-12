const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'jitri',
    password: 'jitri@123',
    database: 'jitri'
});



// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: 'jitri',
//     database: 'jitri'
// });
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
// 测试数据库连接
(async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
})();
module.exports = {pool, generateOrderNum};
