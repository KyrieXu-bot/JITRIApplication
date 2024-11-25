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


async function getCustomers(searchNameTerm, searchContactNameTerm, searchContactPhoneTerm) {
    const connection = await pool.getConnection();
    try {
        let query = `
            SELECT 
                customer_id,
                customer_name,
                customer_address,
                contact_name,
                contact_phone_num,
                contact_email
            FROM customers
        `;

        const queryParams = [];
        const conditions = [];

        if (searchNameTerm) {
            conditions.push('customer_name LIKE ?');
            queryParams.push(`%${searchNameTerm}%`);
        }

        if (searchContactNameTerm) {
            conditions.push('contact_name LIKE ?');
            queryParams.push(`%${searchContactNameTerm}%`);
        }

        if (searchContactPhoneTerm) {
            conditions.push('contact_phone_num LIKE ?');
            queryParams.push(`%${searchContactPhoneTerm}%`);
        }

        // 如果有任何条件，添加 WHERE 子句
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await connection.query(query, queryParams);
        return rows;

    } finally {
        connection.release();
    }
}

async function getPayers(searchNameTerm, searchContactNameTerm, searchContactPhoneTerm) {
    const connection = await pool.getConnection();
    try {
        let query = `
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
        `;
        const queryParams = [];
        const conditions = [];

        if (searchNameTerm) {
            conditions.push('payer_name LIKE ?');
            queryParams.push(`%${searchNameTerm}%`);
        }

        if (searchContactNameTerm) {
            conditions.push('payer_contact_name LIKE ?');
            queryParams.push(`%${searchContactNameTerm}%`);
        }

        if (searchContactPhoneTerm) {
            conditions.push('payer_contact_phone_num LIKE ?');
            queryParams.push(`%${searchContactPhoneTerm}%`);
        }

        // 如果有任何条件，添加 WHERE 子句
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await connection.query(query, queryParams);
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
