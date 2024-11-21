const mysql = require('mysql2/promise');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'jitri',
//     password: 'jitri@123',
//     database: 'jitri'
// });



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


async function getCustomers() {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(`
            SELECT 
                customer_id,
                customer_name,
                customer_address,
                contact_name,
                contact_phone_num,
                contact_email
            FROM customers
        `);
        return rows;

    } finally {
        connection.release();
    }
}

async function getPayers() {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(`
            SELECT 
                payment_id,
                payer_name,
                payer_address,
                payer_phone_num,
                bank_name,
                tax_number,
                bank_account,
                payer_contact_name,
                payer_contact_phone_num,
                payer_contact_email
            FROM payments
        `);
        return rows;
    } finally {
        connection.release();
    }
}

async function insertCustomer(customerData) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(`
            INSERT INTO customers (customer_name, customer_address, contact_name, contact_phone_num, contact_email)
            VALUES (?, ?, ?, ?, ?)
        `, [customerData.customer_name, customerData.customer_address, customerData.contact_name, customerData.contact_phone_num, customerData.contact_email]);
        return result.insertId;
    } finally {
        connection.release();
    }
}

async function insertPayment(paymentData) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(`
            INSERT INTO payments (payer_name, payer_address, payer_phone_num, bank_name, tax_number, bank_account, payer_contact_name, payer_contact_phone_num, payer_contact_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [paymentData.payer_name, paymentData.payer_address, paymentData.payer_phone_num, paymentData.bank_name, paymentData.tax_number, paymentData.bank_account, paymentData.payer_contact_name, paymentData.payer_contact_phone_num, paymentData.payer_contact_email]);
        return result.insertId;
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




module.exports = {
    pool, 
    generateOrderNum,
    insertCustomer,
    insertPayment,
    getCustomers,
    getPayers
};
