const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    // 1. 读取模板
    const tplPath = path.resolve(__dirname, '../templates/process_template.docx');
    const content = fs.readFileSync(tplPath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    // 2. 渲染数据
    doc.render(data);

    // 3. 生成 buffer
    const buf = doc.getZip().generate({ type: 'nodebuffer' });

    // 4. 设置 headers 并返回
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename=SampleFlow_${data.order_num}.docx`,
    });
    res.send(buf);
  } catch (e) {
    console.error('Failed to generate sample flow:', e);
    res.status(500).json({ message: 'Error generating sample flow', error: e.message });
  }
});

module.exports = router;