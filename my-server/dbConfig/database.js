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


async function getCustomers(searchNameTerm, searchContactNameTerm, searchContactPhoneTerm) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let query = `
            SELECT 
                customer_id,
                customer_name,
                customer_address,
                contact_name,
                contact_phone_num,
                contact_email
            FROM customers
            WHERE category = '1'
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
            query += ' AND ' + conditions.join(' AND ');
        }

        const [rows] = await connection.query(query, queryParams);
        await connection.commit();

        return rows;

    } catch (error) {
        // 发生错误时回滚事务
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getPayers(searchNameTerm, searchContactNameTerm, searchContactPhoneTerm) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

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
            WHERE category = '1'
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
            query += ' AND ' + conditions.join(' AND ');
        }

        const [rows] = await connection.query(query, queryParams);
        await connection.commit();

        return rows;
    } catch (error) {
        // 发生错误时回滚事务
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getPayersGroup(searchNameTerm) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let query = `
            SELECT 
                payer_name,
                payer_address,
                payer_phone_num,
                bank_name,
                tax_number,
                bank_account
            FROM payments
            WHERE category = '1'
        `;
        const queryParams = [];
        const conditions = [];

        if (searchNameTerm) {
            conditions.push('payer_name LIKE ?');
            queryParams.push(`%${searchNameTerm}%`);
        }

        // 如果有任何条件，添加 WHERE 子句
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        query += `
            GROUP BY 
                payer_name,
                payer_address,
                payer_phone_num,
                bank_name,
                tax_number,
                bank_account
        `;

        const [rows] = await connection.query(query, queryParams);
        await connection.commit();

        return rows;
    } catch (error) {
        // 发生错误时回滚事务
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function insertCustomer(customerData) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [customerResult] = await connection.execute(`
            INSERT INTO customers (customer_name, customer_address, contact_name, contact_phone_num, contact_email, category)
            VALUES (?, ?, ?, ?, ?, '1')
        `, [customerData.customer_name, 
            customerData.customer_address, 
            customerData.contact_name, 
            customerData.contact_phone_num, 
            customerData.contact_email
        ]);
        
        const customerId = customerResult.insertId;
        // 提交事务
        await connection.commit();
        return customerId;
    } catch (error) {
        // 发生错误时回滚事务
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function insertPayment(paymentData) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(`
            INSERT INTO payments (payer_name, payer_address, payer_phone_num, bank_name, tax_number, bank_account, payer_contact_name, payer_contact_phone_num, payer_contact_email, balance, category, area, organization)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '1', ?, ?)
        `, [paymentData.payer_name, 
            paymentData.payer_address, 
            paymentData.payer_phone_num, 
            paymentData.bank_name, 
            paymentData.tax_number, 
            paymentData.bank_account, 
            paymentData.payer_contact_name, 
            paymentData.payer_contact_phone_num, 
            paymentData.payer_contact_email || null, 
            paymentData.balance || 0,
            paymentData.area, 
            paymentData.organization 
        ]);
        const paymentId = result.insertId;
        if(paymentData.balance && paymentData.balance > 0){
            // 插入交易记录
            await connection.execute(`
                INSERT INTO transactions (payment_id, transaction_type, amount, balance_after_transaction, transaction_time, description)
                VALUES (?, 'DEPOSIT', ?, ?, NOW(), ?)
            `, [paymentId, paymentData.balance, paymentData.balance, '新用户初始充值']);
        }
        await connection.commit();
        return result.insertId;
    } finally {
        connection.release();
    }
}



async function queryPayment(customerId) {
    const connection = await pool.getConnection();
    try {
        const query = `
            SELECT o.payment_id, o.order_id, o.customer_id,
                p.payer_name, p.payer_contact_name, p.payer_contact_phone_num
            FROM orders o
            JOIN payments p ON o.payment_id = p.payment_id
            WHERE o.customer_id = ? AND o.payment_id IS NOT NULL
            LIMIT 1;
        `;
        const [rows] = await connection.query(query, [customerId]);
        await connection.commit();

        return rows;
    } catch (error) {
        await connection.rollback();
        throw error;
      }finally {
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
    getPayers,
    queryPayment,
    getPayersGroup
};
