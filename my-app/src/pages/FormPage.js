import React, { useState, useEffect } from 'react';
import { createCommission, getPaymentInfoByPhoneNumber, getSalesperson } from '../api/api';

import '../css/Form.css'

function FormPage() {

  const [salespersons, setSalespersons] = useState([]);

  // 静态部门数据
  const departments = [
    { department_id: 1, department_name: '显微组织表征实验室' },
    { department_id: 2, department_name: '物化性能测试实验室' },
    { department_id: 3, department_name: '力学性能测试实验室' }
  ];

  // 初始化表单数据
  const [formData, setFormData] = useState({
    reportType: [],
    customerInfo: {
      customerName: '',
      customerAddress: '',
      contactName: '',
      contactPhoneNum: '',
      contactEmail: ''
    },
    vatType: '',
    serviceType: '',
    sampleSolutionType: '',
    paperReportShippingType: '',
    totalPrice: '',
    salesPerson: '',
    showPaperReport: false,
    payerInfo: {
      payerName: '',
      payerAddress: '',
      payerPhoneNum: '',
      bankName: '',
      taxNumber: '',
      bankAccount: '',
      payerContactName: '',
      payerContactPhoneNum: '',
      payerContactEmail: ''
    },
    sampleInfo: {
      sampleName: '',
      material: '',
      productNo: '',
      materialSpec: '',
    },
    sampleType: [],
    testItems: [],
  });

  // 映射客户(委托方)信息字段到更友好的显示名称
  const customerInfoLabels = {
    customerName: '公司/单位名称:',
    customerAddress: '公司/单位地址:',
    sampleName: '样品名称 Samples Name:',
    material: '材料 Material:',
    productNo: '货号或批号 Product or Lot No:',
    materialSpec: '材料规范 Material Spec:',
    contactName: '委托联系人:',
    contactPhoneNum: '电话: ',
    contactEmail: 'E-mail:'
  };

  // 映射付款方信息字段到更友好的显示名称
  const payerInfoLabels = {
    payerName: '名称:',
    payerAddress: '地址:',
    payerPhoneNum: '电话:',
    bankName: '开户银行:',
    taxNumber: '税号:',
    bankAccount: '银行账号:',
    payerContactName: '付款联系人 Payer:',
    payerContactPhoneNum: '电话:',
    payerContactEmail: '电子邮件 E-mail:'
  };

  const sampleInfoLabels = {
    sampleName: '样品名称 Sample Name',
    material: '材料 Material',
    productNo: '货号 Product No',
    materialSpec: '材料规范 Material Spec',

  }


  const reportOptions = {
    '测试图片或数据汇总': 1,
    '电子版中文': 2,
    '电子版英文': 3,
    '纸质版中文': 4,
    '纸质版英文': 5
  }

  const typeMappings = {
    sampleType: {
      '板材': 1,
      '棒材': 2,
      '粉末': 3,
      '液体': 4,
      '其他': 5
    },
  }


  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        getSalesperson()
          .then(response => {
            setSalespersons(response.data);
          })
          .catch(error => {
            console.error('拉取销售人员失败:', error);
          });
      } catch (error) {
        console.error('Error fetching salespersons:', error);
      }
    };
    fetchSalespersons();
  }, []);


  //预填付款方信息
  const handlePrefillPaymentInfo = () => {
    const phoneNumber = formData.customerInfo.contactPhoneNum; // 假设你的表单数据中已有phoneNumber字段
    if (!phoneNumber) {
      alert('请先填写手机号！');
      return;
    }

    getPaymentInfoByPhoneNumber(phoneNumber)
      .then(response => {
        console.log(response.data)
        setFormData(prevState => ({
          ...prevState,
          payerInfo: {
            payerName: response.data.payer_name,
            payerAddress: response.data.payer_address,
            payerPhoneNum: response.data.payer_phone_num,
            bankName: response.data.bank_name,
            taxNumber: response.data.tax_number,
            bankAccount: response.data.bank_account,
            payerContactName: response.data.payer_contact_name,
            payerContactPhoneNum: response.data.payer_contact_phone_num,
            payerContactEmail: response.data.payer_contact_email
          }
        }));
        alert('信息预填成功！');

      })
      .catch(error => {
        console.error('Error fetching payment info:', error);
        alert('未查询到对应的付款方信息！');
      });
  };


  const handleDepartmentChange = (index, newDepartmentId) => {
    console.log(newDepartmentId)
    const updatedTestItems = formData.testItems.map((item, idx) => {
      if (idx === index) {
        return { ...item, department_id: newDepartmentId };
      }
      return item;
    });
    setFormData(prev => ({
      ...prev,
      testItems: updatedTestItems
    }));
  };

  const addTestItem = () => {
    // 添加新的检测项目空行
    setFormData(prev => ({
      ...prev,
      testItems:
        [...prev.testItems,
        {
          original_no: '',
          test_item: '',
          test_method: '',
          size: '',
          quantity: '',
          note: '',
          department_id: ''
        }]
    }));
  };

  const handleTestItemChange = (index, field, value) => {
    // 处理检测项目字段的更新
    const updatedItems = formData.testItems.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setFormData(prev => ({
      ...prev,
      testItems: updatedItems
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (parent, name, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [name]: value }
    }));
  };

  const handleCheckboxChange = (name, value, checked) => {
    const numValue = typeMappings[name][value];
    if (checked) {
      setFormData(prev => ({
        ...prev,
        [name]: [...prev[name], numValue]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: prev[name].filter(item => item !== numValue)
      }));
    }
  };


  const handleReportTypeChange = (value, checked) => {
    const updatedReportType = checked
      ? [...formData.reportType, reportOptions[value]]
      : formData.reportType.filter(item => item !== reportOptions[value]);

    setFormData({
      ...formData,
      reportType: updatedReportType,
      showPaperReport: updatedReportType.includes(4) || updatedReportType.includes(5)
    });
  };


  //单选框处理
  const handleRadioChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const removeTestItem = (index) => {
    // 删除指定的检测项目
    const filteredItems = formData.testItems.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      testItems: filteredItems
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.reportType.length === 0) {
      alert(`提交失败！报告形式为必填项，请重新选择`);
      return; // 停止提交
    }
    // 委托方必填项
    if (!formData.customerInfo.customerName) {
      alert(`提交失败！客户(公司/单位)名称为必填项，请重新填写`);
      return; // 停止提交
    }
    if (!formData.customerInfo.customerAddress) {
      alert(`提交失败！客户地址为必填项，请重新填写`);
      return; // 停止提交
    }

    if (!formData.customerInfo.contactName) {
      alert(`提交失败！委托联系人为必填项，请重新填写`);
      return; // 停止提交
    }
    if (!formData.customerInfo.contactPhoneNum) {
      alert(`提交失败！客户(公司/单位)电话为必填项，请重新填写`);
      return; // 停止提交
    }
    if (!formData.vatType) {
      alert(`提交失败！发票类型为必填项，请重新填写`);
      return; // 停止提交
    }

    //付款方必填项
    if (!formData.payerInfo.payerName) {
      alert(`提交失败！付款方${payerInfoLabels.payerName}为必填项，请重新填写`);
      return; // 停止提交
    }
    if (!formData.payerInfo.payerAddress) {
      alert(`提交失败！付款方${payerInfoLabels.payerAddress}为必填项，请重新填写`);
      return; // 停止提交
    }
    if (!formData.payerInfo.payerPhoneNum) {
      alert(`提交失败！付款方${payerInfoLabels.payerPhoneNum}为必填项，请重新填写`);
      return; // 停止提交
    }
    if (!formData.payerInfo.bankName) {
      alert(`提交失败！付款方${payerInfoLabels.bankName}为必填项，请重新填写`);
      return; // 停止提交
    }
    if (!formData.payerInfo.taxNumber) {
      alert(`提交失败！付款方${payerInfoLabels.taxNumber}为必填项，请重新填写`);
      return; // 停止提交
    }
    if (!formData.payerInfo.bankAccount) {
      alert(`提交失败！付款方${payerInfoLabels.bankAccount}为必填项，请重新填写`);
      return; // 停止提交
    }
    if (!formData.payerInfo.payerContactName) {
      alert(`提交失败！付款方${payerInfoLabels.payerContactName}为必填项，请重新填写`);
      return; // 停止提交
    }
    if (!formData.payerInfo.payerPhoneNum) {
      alert(`提交失败！付款方${payerInfoLabels.payerContactPhoneNum}为必填项，请重新填写`);
      return; // 停止提交
    }
    if (!formData.payerInfo.payerContactEmail) {
      alert(`提交失败！付款方${payerInfoLabels.payerContactEmail}为必填项，请重新填写`);
      return; // 停止提交
    }

    if (!formData.sampleInfo.material) {
      alert(`提交失败！材料为必填项，请重新填写`);
      return; // 停止提交
    }

    for (let i = 0; i < formData.testItems.length; i++) {
      const testItem = formData.testItems[i];
      if (!testItem.test_item) {
        alert(`提交失败！第${i + 1}个检测项目的测试项目为必填项，请重新填写`);
        return; // 停止提交
      }
      if (!testItem.quantity) {
        alert(`提交失败！第${i + 1}个检测项目的数量为必填项，请重新填写`);
        return; // 停止提交
      }
    }

    if (!formData.serviceType) {
      alert(`提交失败！服务类型为必填项，请重新填写`);
      return; // 停止提交
    }

    if (!formData.sampleSolutionType) {
      alert(`提交失败！样品处置为必填项，请重新填写`);
      return; // 停止提交
    }

    const commissionData = {
      customerInfo: {
        //customer表
        customer_name: formData.customerInfo.customerName,
        customer_address: formData.customerInfo.customerAddress,
        contact_name: formData.customerInfo.contactName,
        contact_phone_num: formData.customerInfo.contactPhoneNum,
        contact_email: formData.customerInfo.contactEmail,
      },
      orderInfo: {
        //order表
        service_type: formData.serviceType,
        sample_shipping_address: formData.sampleShippingAddress,
        total_price: formData.totalPrice
      },
      paymentInfo: {
        //payment表
        vat_type: formData.vatType,
        payer_name: formData.payerInfo.payerName,
        payer_address: formData.payerInfo.payerAddress,
        payer_phone_num: formData.payerInfo.payerContactPhoneNum,
        bank_name: formData.payerInfo.bankName,
        tax_number: formData.payerInfo.taxNumber,
        bank_account: formData.payerInfo.bankAccount,
        payer_contact_name: formData.payerInfo.payerContactName,
        payer_contact_phone_num: formData.payerInfo.payerPhoneNum,
        payer_contact_email: formData.payerInfo.payerContactEmail,
      },
      reportInfo: {
        //reports表
        type: formData.reportType,
        paper_report_shipping_type: formData.paperReportShippingType,
        report_additional_info: formData.reportAdditionalInfo,
      },
      sampleInfo: {
        //samples表
        sample_name: formData.sampleInfo.sampleName,
        material: formData.sampleInfo.material,
        product_no: formData.sampleInfo.productNo,
        material_spec: formData.sampleInfo.materialSpec,
        sample_solution_type: formData.sampleSolutionType,
        sample_type: formData.sampleType,
      },
      assignmentInfo:{
        //assignments表
        account: formData.salesPerson,
      },
      //testItems表
      testItems: formData.testItems
    };
    console.log("看看往后面传啥：", commissionData)


    //新建检测
    createCommission(commissionData)
      .then(response => {
        console.log('Creating commission Success:', response.data);
      })
      .catch(error => {
        console.error('Creating commission Error:', error);
      });
    alert('表单已提交，查看控制台获取数据');
  };

  //需要加必填项(*)的模块
  const requiredFields = {
    customerInfo: [
      'customerName',
      'customerAddress',
      'contactName',
      'contactPhoneNum'
    ], // 假设客户名称是必填的
    payerInfo: [
      'payerName',
      'payerAddress',
      'payerPhoneNum',
      'bankName',
      'taxNumber',
      'bankAccount',
      'payerContactName',
      'payerContactPhoneNum',
      'payerContactEmail'
    ], // 付款方的必填信息

    sampleInfo: ['material'],

  };

  return (
    <div>
      <h1>检测委托单(Application Form)</h1>
      <p>收样地址：江苏省苏州市相城区青龙岗路286号1楼<br></br>
        联系人：龚菊红 17306221329<br></br>
        邮箱：services@jitri-amrd.com<br></br>
        注：本表中带★号处为必填项目，测试预约安排以邮箱收到的委托单顺序为准，一份委托单只出一份报告。多份报告或英文报告收费。
      </p>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>报告形式</legend>
          {Object.keys(reportOptions).map((option) => (
            <label key={option}>
              <input
                type="checkbox"
                value={option}
                onChange={(e) => handleReportTypeChange(option, e.target.checked)}
                checked={formData.reportType.includes(reportOptions[option])}
              /> {option}
            </label>
          ))}
        </fieldset>


        {/* 客户信息输入部分 */}
        <h3>委托方信息</h3>
        <button type="button" onClick={handlePrefillPaymentInfo}>预填付款方信息</button>
        <br></br>
        <div class="block">
          {Object.keys(formData.customerInfo).map(key => (
            <label key={key}>
              {customerInfoLabels[key]} {requiredFields.customerInfo.includes(key) && <span style={{ color: 'red' }}>*</span>}
              <input
                type="text"
                name={key}
                value={formData.customerInfo[key]}
                onChange={(e) => handleNestedChange('customerInfo', key, e.target.value)}
              />
              <br></br>
            </label>
          ))}
        </div>

        {/* 客户信息输入部分 */}
        <h3>付款方</h3>
        <fieldset>
          <legend>发票类型</legend>
          <label>
            <input type="radio" name="vatType" value="1" onChange={handleRadioChange} checked={formData.vatType === '1'} /> 增值税普通发票
          </label>
          <label>
            <input type="radio" name="vatType" value="2" onChange={handleRadioChange} checked={formData.vatType === '2'} /> 增值税专用发票
          </label>
        </fieldset>
        <div class="block">
          {Object.keys(formData.payerInfo).map(key => (
            <label key={key}>
              {payerInfoLabels[key]} {requiredFields.payerInfo.includes(key) && <span style={{ color: 'red' }}>*</span>}
              <input
                type="text"
                name={key}
                value={formData.payerInfo[key]}
                onChange={(e) => handleNestedChange('payerInfo', key, e.target.value)}
              />
              <br></br>
            </label>
          ))}
        </div>

        {/* 样品信息输入部分 */}
        <h3>样品信息</h3>
        <fieldset>
          <legend>样品类型</legend>
          {/* 复选框列表 */}
          {Object.keys(typeMappings.sampleType).map((type) => (
            <label key={type}>
              <input
                type="checkbox"
                name="sampleType"
                value={type}
                onChange={(e) => handleCheckboxChange('sampleType', type, e.target.checked)}
              /> {type}
            </label>
          ))}
        </fieldset>
        <div class="block">
          {Object.keys(formData.sampleInfo).map(key => (
            <label key={key}>
              {sampleInfoLabels[key]} {requiredFields.sampleInfo.includes(key) && <span style={{ color: 'red' }}>*</span>}
              <input
                type="text"
                name={key}
                value={formData.sampleInfo[key]}
                onChange={(e) => handleNestedChange('sampleInfo', key, e.target.value)}
              />
              <br></br>
            </label>
          ))}
        </div>


        <h3>检测项目</h3>
        <table className="test-item-table">
          <thead>
            <tr>
              <th className="num">序号 No.</th>
              <th>样品原号</th>
              <th>检测项目</th>
              <th>检测方法</th>
              <th>尺寸</th>
              <th>数量</th>
              <th>时间周期</th>
              <th>所属部门</th>
              <th>备注</th>
              <th id="operation">操作</th>
            </tr>
          </thead>
          <tbody>
            {formData.testItems.map((item, index) => (
              <tr key={index}>
                <td className="num">{index + 1}</td>
                <td><input type="text" value={item.originalNo} onChange={(e) => handleTestItemChange(index, 'original_no', e.target.value)} /></td>
                <td><input type="text" value={item.testItem} onChange={(e) => handleTestItemChange(index, 'test_item', e.target.value)} /></td>
                <td><input type="text" value={item.testMethod} onChange={(e) => handleTestItemChange(index, 'test_method', e.target.value)} /></td>
                <td><input type="text" valuiie={item.size} onChange={(e) => handleTestItemChange(index, 'size', e.target.value)} /></td>
                <td><input type="number" value={item.quantity} onChange={(e) => handleTestItemChange(index, 'quantity', e.target.value)} /></td>
                <td><input type="number" style={{width: 50 + 'px'}} value={item.deadline} onChange={(e) => handleTestItemChange(index, 'deadline', e.target.value)} />天</td>

                <td>
                  <select value={item.department_id || ""} onChange={e => handleDepartmentChange(index, e.target.value)}>
                    <option value="" disabled>---请选择---</option>
                    {departments.map(dept => (
                      <option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>
                    ))}
                  </select>
                </td>
                <td><input type="text" value={item.note} onChange={(e) => handleTestItemChange(index, 'note', e.target.value)} /></td>
                <td className="add-remove-buttons">
                  <button type="button" className="add-button" onClick={() => addTestItem(index)}>+</button>
                  <button type="button" className="remove-button" onClick={() => removeTestItem(index)}>-</button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="10">
                <button type="button" onClick={addTestItem} style={{ width: '100%' }}>添加新项目</button>
              </td>
            </tr>
          </tbody>
        </table>


        <fieldset>
          <legend>服务类型&nbsp;<span style={{ color: 'red' }}>*</span></legend>
          <label>
            <input type="radio" name="serviceType" value="1" onChange={handleRadioChange} checked={formData.serviceType === '1'} /> 常规(正常排单周期)
          </label>
          <label>
            <input type="radio" name="serviceType" value="2" onChange={handleRadioChange} checked={formData.serviceType === '2'} /> 加急（*1.5）
          </label>
          <label>
            <input type="radio" name="serviceType" value="3" onChange={handleRadioChange} checked={formData.serviceType === '3'} /> 特急（*2）
          </label>
        </fieldset>

        <fieldset>
          <legend>样品处置&nbsp;<span style={{ color: 'red' }}>*</span></legend>
          <label>
            <input type="radio" name="sampleSolutionType" value="1" onChange={handleRadioChange} checked={formData.sampleSolutionType === '1'} /> 不退(样品留存90天，逾期销毁)
          </label>
          <label>
            <input type="radio" name="sampleSolutionType" value="2" onChange={handleRadioChange} checked={formData.sampleSolutionType === '2'} /> 客户自取
          </label>
          <label>
            <input type="radio" name="sampleSolutionType" value="3" onChange={handleRadioChange} checked={formData.sampleSolutionType === '3'} /> 寄回
          </label>
          {formData.sampleSolutionType === '3' && (
            <label>
              请输入寄送地址:
              <input
                type="text"
                name="sampleShippingAddress"
                value={formData.sampleShippingAddress}
                onChange={handleInputChange}
              />
            </label>
          )}
        </fieldset>

        <fieldset>
          <legend>销售信息</legend>
          <label for="price">
            请输入服务总价:
            <input
              type="text"
              id="price"
              name="totalPrice"
              value={formData.totalPrice}
              onChange={handleInputChange}
              className="input-price" placeholder="￥0.00"
            />
          </label>
          <label>
            选择业务员:
            <select
              name="salesPerson"
              value={formData.salesPerson}
              onChange={handleInputChange}
            >
              <option value="">请选择业务员</option>
              {salespersons.map((person) => (
                <option key={person.account} value={person.account}>{`${person.name} (${person.account})`}</option>
              ))}
            </select>
          </label>
        </fieldset>


        {formData.showPaperReport && (
          <fieldset>
            <legend>纸质版报告</legend>
            {/* 例如邮寄选项 */}
            <label>
              <input type="radio" name="paperReportShippingType" value="1" onChange={handleRadioChange} /> 邮寄到委托方
            </label>
            <label>
              <input type="radio" name="paperReportShippingType" value="2" onChange={handleRadioChange} /> 邮寄到付款方
            </label>
            <label>
              <input type="radio" name="paperReportShippingType" value="3" onChange={handleRadioChange} /> 其他(地址/收件人/电话)
            </label>
            {formData.paperReportShippingType === '3' && (
              <label>
                请输入地址、收件人和电话:
                <input
                  type="text"
                  name="reportAdditionalInfo"
                  value={formData.reportAdditionalInfo}
                  onChange={handleInputChange}
                />
              </label>
            )}
          </fieldset>
        )}
        <button type="button" onClick={() => window.print()}>表单打印</button>
        <button type="submit" class="submit">提交表单</button>

      </form>
    </div>
  );
}

export default FormPage;
