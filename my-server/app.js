const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());  // 允许跨域请求
app.use(express.json());  // 用于解析 JSON 格式的请求体


const customerRoutes = require('./routes/customers');
const commissionRoutes = require('./routes/commission');
const paymentRoutes = require('./routes/payment');
const salespersonRoutes = require('./routes/salespersons');
const testRoutes = require('./routes/test');
const priceRoutes = require('./routes/price');
const documentRoutes = require('./routes/documents');
const flowRoutes = require('./routes/flow');

app.use('/customers', customerRoutes);
app.use('/commission', commissionRoutes);
app.use('/payments', paymentRoutes);
app.use('/salespersons', salespersonRoutes);
app.use('/test-db', testRoutes);
app.use('/price', priceRoutes);
app.use('/documents', documentRoutes);
app.use('/flow', flowRoutes);


// 设置静态文件目录
app.use(express.static(path.join(__dirname, '../my-app/build')));



// 处理React路由
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../my-app/build', 'index.html'));
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://192.168.9.46:${PORT}`);
});




