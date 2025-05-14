const express = require('express');
const fs      = require('fs');
const path    = require('path');
const PizZip      = require('pizzip');
const Docxtemplater = require('docxtemplater');

const router = express.Router();

// POST /api/documents
// 接收模板数据 JSON，生成并返回填好数据的 .docx
router.post('/', (req, res) => {
  try {
    // 1. 从请求体拿到前端传来的所有模板字段
    //    确保前端传的是 templateData 对象
    const templateData = req.body;

    // 2. 读取 Word 模板（.docx 实际上是个 ZIP 包）
    const templatePath = path.resolve(__dirname, '../templates/template.docx');
    const content      = fs.readFileSync(templatePath, 'binary');

    // 3. 用 PizZip 解压
    const zip = new PizZip(content);

    // 4. 用 Docxtemplater 加载并设置数据
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true
    });
    console.log(templateData)
    doc.render(templateData);


    // 6. 重新打包成 .docx 二进制
    const buf = doc.getZip().generate({ type: 'nodebuffer' });

    // 7. 发送给客户端，触发下载
    const fileName = `Commission.docx`;
    res.set({
      'Content-Type':        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename=${fileName}`
    });
    res.send(buf);
    console.log(fileName)
  } catch (err) {
    console.error('Failed to generate document:', err);
    // 如果占位符错误，doc.setData/ doc.render() 会抛
    res.status(500).send('文档生成失败');
  }
});

module.exports = router;
