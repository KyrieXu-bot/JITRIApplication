import React, { useState, useEffect } from 'react';
import {
  getCommission,
  createCommission,
  generateDocument,
  getSalesperson,
  getCustomers,
  getPayers,
  prefillPayment,
  getPrices,
  getSalespersonContact,
  generateSampleFlow
} from '../api/api';
import { useNavigate } from 'react-router-dom';
import '../css/Form.css'

function FormPage() {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPrefillModal, setShowPrefillModal] = useState(false);
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [commissionFileName, setCommissionFileName] = useState('');
  const [flowFileName, setFlowFileName] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [commissionUrl, setCommissionUrl] = useState('');
  const [flowUrl, setFlowUrl] = useState('');
  const [salespersons, setSalespersons] = useState([]);
  const [salesName, setSalesName] = useState('');
  const [salesEmail, setSalesEmail] = useState('');
  const [salesPhone, setSalesPhone] = useState('');
  const [customers, setCustomers] = useState([]);
  const [payers, setPayers] = useState([]);
  const [prefillPayers, setPrefillPayers] = useState([]);
  const [searchCustomerNameTerm, setSearchCustomerNameTerm] = useState('');
  const [searchContactNameTerm, setSearchContactNameTerm] = useState('');
  const [searchContactPhoneTerm, setSearchContactPhoneTerm] = useState('');
  const [searchTestItem, setSearchTestItem] = useState('');
  const [searchTestCondition, setSearchTestCondition] = useState('');
  const [searchTestCode, setSearchTestCode] = useState('');

  const [searchPayerNameTerm, setSearchPayerNameTerm] = useState('');
  const [searchPayerContactNameTerm, setSearchPayerContactNameTerm] = useState('');
  const [searchPayerContactPhoneTerm, setSearchPayerContactPhoneTerm] = useState('');

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPayer, setSelectedPayer] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [selectedTestIndex, setSelectedTestIndex] = useState(null);

  // 静态部门数据
  const departments = [
    { department_id: 1, department_name: '显微组织表征实验室' },
    { department_id: 2, department_name: '物化性能测试实验室' },
    { department_id: 3, department_name: '力学性能测试实验室' },
    { department_id: 4, department_name: '委外' }

  ];
  const navigate = useNavigate();

  // 初始化表单数据
  const [formData, setFormData] = useState({
    reportType: [],
    reportHeader: '',
    reportHeaderAdditionalInfo: '',
    reportForm: '',
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
    sampleReturnInfo: {
      returnAddressOption: '',
      returnAddress: ''
    },
    deliveryDays: '',
    reportSeals: [],
    sampleShippingAddress: '',
    reportAdditionalInfo: '',
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
    sampleRequirements: {
      hazards: [],            // 多选：hazardOptions key 列表
      hazardOther: '',        // 其他说明
      magnetism: '',          // 单选：magnetismOptions key
      conductivity: '',       // 单选：conductivityOptions key
      breakable: '',          // 单选：'yes' | 'no'
      brittle: ''             // 单选：'yes' | 'no'
    },
    otherRequirements: '',
    subcontractingNotAccepted: false,
    testItems: [],
    orderNum: ''
  });

  // 映射客户(委托方)信息字段到更友好的显示名称
  // const customerInfoLabels = {
  //   customerName: '公司/单位名称:',
  //   customerAddress: '公司/单位地址:',
  //   sampleName: '样品名称 Samples Name:',
  //   material: '材料 Material:',
  //   productNo: '货号或批号 Product or Lot No:',
  //   materialSpec: '材料规范 Material Spec:',
  //   contactName: '委托联系人:',
  //   contactPhoneNum: '电话: ',
  //   contactEmail: 'E-mail:'
  // };

  // 映射付款方信息字段到更友好的显示名称
  // const payerInfoLabels = {
  //   payerName: '名称:',
  //   payerAddress: '地址:',
  //   payerPhoneNum: '电话:',
  //   bankName: '开户银行:',
  //   taxNumber: '税号:',
  //   bankAccount: '银行账号:',
  //   payerContactName: '付款联系人 Payer:',
  //   payerContactPhoneNum: '电话:',
  //   payerContactEmail: '电子邮件 E-mail:'
  // };



  const reportOptions = {
    '测试图片或数据汇总(无需测试报告) Test pictures or data summaries(No test report)': 1,
    '中文报告 Chinese report': 2,
    '英文报告 English report': 3,
    '仅电子版报告': 4,
    '电子版+纸质版报告': 5,
    '中英文对照报告Chinese-English bilingual report': 6
  }

  // 报告抬头选项
  const reportHeaderOptions = {
    '同委托方名称和地址 Same as applicant': 1,
    '其他 (地址/收件人/电话) Others (Address/Recipient/Tel)': 2
  };

  // 报告版式选项
  const reportFormOptions = {
    '一份委托单对应一个报告 One application Form To a Report': 1,
    '每一个项目对应一份报告 Each Item Corresponds To a Report': 2
  };

  const typeMappings = {
    sampleType: {
      '板材': 1,
      '棒材': 2,
      '粉末': 3,
      '液体': 4,
      '其他': 5
    },
  }

  // 在组件外定义选项映射
  const hazardOptions = [
    { key: 'Safety', label: '无危险性 Safety' },
    { key: 'Flammability', label: '易燃易爆 Flammability' },
    { key: 'Irritation', label: '刺激性 Irritation' },
    { key: 'Volatility', label: '易挥发 Volatility' },
    { key: 'Fragile', label: '易碎 Fragile' },
    { key: 'Other', label: '其他 Other' }

  ];

  const magnetismOptions = [
    { key: 'Non-magnetic', label: '无磁 Non-magnetic' },
    { key: 'Weak-magnetic', label: '弱磁 Weak-magnetic' },
    { key: 'Strong-magnetic', label: '强磁 Strong-magnetic' },
    { key: 'Unknown', label: '未知 Unknown' }
  ];

  const conductivityOptions = [
    { key: 'Conductor', label: '导体 Conductor' },
    { key: 'Semiconductor', label: '半导体 Semiconductor' },
    { key: 'Insulator', label: '绝缘体 Insulator' },
    { key: 'Unknown', label: '未知 Unknown' }
  ];

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        getCustomers(searchCustomerNameTerm,
          searchContactNameTerm,
          searchContactPhoneTerm
        )
          .then(response => {
            setCustomers(response.data);
          })
          .catch(error => {
            console.error('拉取委托方信息失败:', error);
          });
      } catch (error) {
        console.error('拉取委托方信息失败:', error);
      }
    };
    fetchCustomers();

    const fetchPayers = async () => {
      try {
        getPayers(searchPayerNameTerm,
          searchPayerContactNameTerm,
          searchPayerContactPhoneTerm
        )
          .then(response => {
            setPayers(response.data);
          })
          .catch(error => {
            console.error('拉取付款方信息失败:', error);
          });
      } catch (error) {
        console.error('拉取付款方信息失败:', error);
      }
    };
    fetchPayers();

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

    const fetchPrices = async () => {
      try {
        getPrices(
          searchTestItem,
          searchTestCondition,
          searchTestCode
        )
          .then(response => {
            setPriceList(response.data);
          })
          .catch(error => {
            console.error('拉取价目表失败:', error);
          });
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };
    fetchPrices();
  }, [searchCustomerNameTerm,
    searchContactNameTerm,
    searchContactPhoneTerm,
    searchPayerNameTerm,
    searchPayerContactNameTerm,
    searchPayerContactPhoneTerm,
    searchTestItem,
    searchTestCondition,
    searchTestCode
  ]);


  // 点击“预填”后执行：
  const handlePrefill = async () => {
    if (!formData.orderNum) {
      alert('请先输入委托单号');
      return;
    }
    try {
      const { data } = await getCommission(formData.orderNum);
      // 1) customer & payer
      setSelectedCustomer(data.customer);
      setSelectedPayer(data.payer);
      console.log(data.testItems)
      // 2) salesPerson
      // if (data.testItems[0]?.assignment_account) {
      //   const acct = data.testItems[0].assignment_account;
      //   setFormData(f => ({ ...f, salesPerson: acct }));
      //   setSalesName(salespersons.find(s => s.account === acct)?.name || '');
      //   const resp = await getSalespersonContact(acct);
      //   setSalesEmail(resp.data.user_email);
      //   setSalesPhone(resp.data.user_phone_num);
      // }

      if (data.testItems[0]?.assignment_accounts?.length > 0) {
        // 业务员账号含 'YW'
        const acct = data.testItems[0].assignment_accounts.find(acct =>
          acct.includes('YW')
        );
        if (acct) {
          setFormData(f => ({ ...f, salesPerson: acct }));
          setSalesName(salespersons.find(s => s.account === acct)?.name || '');
          const resp = await getSalespersonContact(acct);
          setSalesEmail(resp.data.user_email);
          setSalesPhone(resp.data.user_phone_num);
        }
      }
      const seals = data.orderInfo.report_seals
        ? JSON.parse(data.orderInfo.report_seals)
        : [];

      // 3) 把后端返回的数组 / 字符串 直接写入 state
      setFormData(prev => ({
        ...prev,

        // 报告
        reportType: Array.isArray(data.reportInfo.type)
          ? data.reportInfo.type
          : JSON.parse(data.reportInfo.type || "[]"),
        paperReportShippingType: data.reportInfo.paper_report_shipping_type,
        reportAdditionalInfo: data.reportInfo.report_additional_info || '',
        reportHeader: data.reportInfo.header_type != null
          ? String(data.reportInfo.header_type)
          : '',
        reportHeaderAdditionalInfo: data.reportInfo.header_other || '',
        reportForm: data.reportInfo.format_type != null
          ? String(data.reportInfo.format_type)
          : '',
        // 发票 & 服务周期
        vatType: String(data.vatType),
        serviceType: String(data.orderInfo.service_type),
        reportSeals: seals,
        deliveryDays: data.orderInfo.delivery_days_after_receipt,
        // 其他要求
        otherRequirements: data.orderInfo.other_requirements || '',
        subcontractingNotAccepted: !!data.orderInfo.subcontracting_not_accepted,

        // 样品处置
        sampleSolutionType: String(data.sampleHandling.handling_type),
        sampleReturnInfo: data.sampleHandling.return_info || { returnAddressOption: '', returnAddress: '' },

        // 样品要求
        sampleRequirements: {
          hazards: data.sampleRequirements.hazards || [],
          hazardOther: data.sampleRequirements.hazardOther || '',
          magnetism: data.sampleRequirements.magnetism || '',
          conductivity: data.sampleRequirements.conductivity || '',
          breakable: data.sampleRequirements.breakable || '',
          brittle: data.sampleRequirements.brittle || '',
        },

        // 检测项目
        testItems: data.testItems.map(ti => {
          const standardCodes = Object.values(typeMappings.sampleType).map(String);
          const raw = String(ti.sample_type);              // 后端可能返回数字或文本
          const isStandard = standardCodes.includes(raw);
          return {
            sampleName: ti.sample_name,
            material: ti.material,
            sampleType: isStandard ? raw : '5',
            sampleTypeCustom: isStandard ? '' : ti.sample_type,
            original_no: ti.original_no,
            test_item: ti.test_item,
            test_method: ti.test_method,
            size: ti.size,
            quantity: ti.quantity,
            note: ti.note,
            department_id: ti.department_id,
            deadline: ti.deadline,
            price_id: ti.price_id,
            sample_preparation: ti.sample_preparation,
            test_code: ti.test_code,
            test_standard: ti.test_standard,
            group_id: ti.group_id,
            price_note: ti.price_note
          };
        }),
      }));
      alert('预填成功！');
    } catch (err) {
      console.error('预填失败', err);
      alert('预填数据失败，请检查委托单号是否正确');
    }
  };


  const handleDepartmentChange = (index, newDepartmentId) => {
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
          sampleName: '',
          material: '',
          sampleType: '',
          sampleTypeCustom: '',
          original_no: '',
          test_item: '',
          test_method: '',
          quantity: '',
          note: '',
          department_id: '',
          sample_preparation: ''
        }]
    }));
  };

  // const handleTestItemChange = (index, field, value) => {
  //   // 处理检测项目字段的更新
  //   const updatedItems = formData.testItems.map((item, i) => {
  //     if (i === index) {
  //       return {
  //         ...item,
  //         [field]: value,
  //         price_id: field === 'test_item' ? null : item.price_id // 若手动修改 test_item，则 price_id 设为 null
  //       };
  //     }
  //     return item;
  //   });
  //   setFormData(prev => ({
  //     ...prev,
  //     testItems: updatedItems
  //   }));
  // };

  const handleTestItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      testItems: prev.testItems.map((item, i) => {
        if (i !== index) return item;
        // 基础更新
        const updated = {
          ...item,
          [field]: value,
          // 如果手动改了 test_item，要清掉 price_id
          ...(field === 'test_item' ? { price_id: null } : {})
        };
        // 如果改了样品类型，并且选到“其他(5)”，清 custom；否则删除 custom
        if (field === 'sampleType') {
          if (String(value) === '5') {
            updated.sampleTypeCustom = '';
          } else {
            delete updated.sampleTypeCustom;
          }
        }
        return updated;
      })
    }));
  };

  const handlePriceSelect = (item) => {
    const updatedItems = formData.testItems.map((testItem, i) => {
      if (i === selectedTestIndex) { // 记录当前选择的行索引
        return {
          ...testItem,
          price_id: item.price_id, // 存 price_id
          test_code: item.test_code,
          test_item: `${item.test_item_name} - ${item.test_condition}`, // 预填检测项目
          test_condition: item.test_condition, // 预填检测条件
          test_method: item.test_standard,
          unit_price: item.unit_price, // 预填单价
          department_id: item.department_id
        };
      }
      return testItem;
    });
    setFormData({ ...formData, testItems: updatedItems });

    setShowPriceModal(false);
  };

  // 处理“其它要求”文本
  const handleOtherRequirementsChange = (e) => {
    setFormData(prev => ({
      ...prev,
      otherRequirements: e.target.value
    }));
  };

  // 处理“是否不接受分包”复选框
  const handleSubcontractingChange = (e) => {
    setFormData(prev => ({
      ...prev,
      subcontractingNotAccepted: e.target.checked
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

  // Hazard checkbox 专用 handler
  const handleHazardChange = (key, checked) => {
    setFormData(prev => {
      const list = prev.sampleRequirements.hazards;
      return {
        ...prev,
        sampleRequirements: {
          ...prev.sampleRequirements,
          hazards: checked
            ? [...list, key]
            : list.filter(item => item !== key)
        }
      };
    });
  };

  const handleBack = () => {
    navigate('/');
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

  // 报告章
  const handleReportSealsChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      reportSeals: checked
        ? [...prev.reportSeals, value]
        : prev.reportSeals.filter(v => v !== value),
    }));
  };
  //单选框处理
  const handleRadioChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  // 切换报告抬头
  const handleReportHeaderChange = (e) => {
    setFormData(prev => ({
      ...prev,
      reportHeader: e.target.value
    }));
  };

  // 切换报告版式
  const handleReportFormChange = (e) => {
    setFormData(prev => ({
      ...prev,
      reportForm: e.target.value
    }));
  };
  const removeTestItem = (index) => {
    // 删除指定的检测项目
    const filteredItems = formData.testItems.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      testItems: filteredItems
    }));
  };

  const handleSalespersonChange = (e) => {
    const account = e.target.value;
    setFormData(prev => ({
      ...prev,
      salesPerson: account
    }));
    if (!account) {
      setSalesEmail('');
      setSalesPhone('');
      setSalesName('');
      return;
    }
    const sel = salespersons.find(p => p.account === account);
    setSalesName(sel ? sel.name : '');
    getSalespersonContact(account)
      .then(response => {
        const email = response.data.user_email?.trim() || '';
        const phone = response.data.user_phone_num?.trim() || '';
        setSalesEmail(email);
        setSalesPhone(phone);
      })
      .catch(err => {
        console.error('获取业务员联系信息失败', err);
        setSalesEmail('');
        setSalesPhone('');
      });
  };

  const duplicateTestItem = (index) => {
    setFormData(prev => {
      const items = [...prev.testItems];
      // 复制当前行对象（浅拷贝）
      const copy = { ...items[index] };
      // 插入到它后面
      items.splice(index + 1, 0, copy);
      return { ...prev, testItems: items };
    });
  };

  const downloadFile = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 1. 确认提示

    if (!window.confirm('请确认填写的信息是否正确，确认无误再提交')) return;

    // 2. 必填项校验

    if (!formData.salesPerson) {
      alert('提交失败！服务方联系人为必填项，请选择业务员');
      return;
    }

    if (!selectedCustomer) {
      alert('提交失败！请先选择委托方');
      return;
    }
    if (!formData.vatType) {
      alert('提交失败！发票类型为必填项，请选择增值税发票类型');
      return;
    }
    if (!selectedPayer) {
      alert('提交失败！请先选择付款方');
      return;
    }

    if (!formData.serviceType) {
      alert('提交失败！周期类型为必填项，请重新选择');
      return;
    }
    // if (formData.deliveryDays === '') {
    //   alert('提交失败！交付时间为必填项，请填写交付工作日');
    //   return;
    // }
    if (formData.reportType.length === 0) {
      alert('提交失败！报告文档为必填项，请重新选择');
      return;
    }
    // if (!formData.paperReportShippingType) {
    //   alert('提交失败！纸质版报告寄送地址为必填项，请选择寄送方式');
    //   return;
    // }
    // if (!formData.reportHeader) {
    //   alert('提交失败！报告抬头为必填项，请重新选择');
    //   return;
    // }
    // if (formData.reportHeader === '2' && !formData.reportHeaderAdditionalInfo) {
    //   alert('提交失败！报告抬头“其他”时，地址为必填项');
    //   return;
    // }
    // if (!formData.reportForm) {
    //   alert('提交失败！报告版式为必填项，请重新选择');
    //   return;
    // }
    if (formData.testItems.length === 0) {
      alert('提交失败！请至少添加一行检测项目');
      return;
    }
    // 每行检测项目必填校验
    for (let i = 0; i < formData.testItems.length; i++) {
      const ti = formData.testItems[i];
      if (!ti.sampleName) {
        alert(`提交失败！第${i + 1}行：样品名称为必填项`);
        return;
      }
      if (!ti.material) {
        alert(`提交失败！第${i + 1}行：材质为必填项`);
        return;
      }
      if (!ti.sampleType) {
        alert(`提交失败！第${i + 1}行：样品状态为必填项`);
        return;
      }
      if (!ti.test_item) {
        alert(`提交失败！第${i + 1}行：检测项目为必填项`);
        return;
      }
      if (!ti.test_method) {
        alert(`提交失败！第${i + 1}行：检测标准为必填项`);
        return;
      }
      if (ti.sample_preparation === '') {
        alert(`提交失败！第${i + 1}行：制样为必填项`);
        return;
      }
      if (!ti.quantity) {
        alert(`提交失败！第${i + 1}行：数量为必填项`);
        return;
      }
      if (!ti.department_id) {
        alert(`提交失败！第${i + 1}行：部门为必填项`);
        return;
      }
    }

    // 样品要求
    const req = formData.sampleRequirements;
    if (!req.hazards.length) {
      alert('提交失败！样品危险特性为必填项，请至少选择一项');
      return;
    }
    if (!req.magnetism) {
      alert('提交失败！样品磁性为必填项，请选择');
      return;
    }
    if (!req.conductivity) {
      alert('提交失败！样品导电性为必填项，请选择');
      return;
    }
    if (!req.breakable) {
      alert('提交失败！是否可破坏为必填项，请选择');
      return;
    }
    if (!req.brittle) {
      alert('提交失败！是否孤品为必填项，请选择');
      return;
    }

    // 余样处置
    if (!formData.sampleSolutionType) {
      alert('提交失败！余样处置为必填项，请重新选择');
      return;
    }
    if (
      formData.sampleSolutionType === '3' &&
      formData.sampleReturnInfo.returnAddressOption === 'other' &&
      !formData.sampleShippingAddress
    ) {
      alert('提交失败！退回地址为必填项');
      return;
    }

    // 3. 组装提交数据
    const commissionData = {
      // 委托方 & 付款方
      customerId: selectedCustomer.customer_id,
      paymentId: selectedPayer.payment_id,

      // 订单信息（以委托单为单位）
      orderInfo: {
        service_type: formData.serviceType,
        sample_shipping_address:
          formData.sampleSolutionType === '3' && formData.sampleReturnInfo.returnAddressOption === 'other'
            ? formData.sampleShippingAddress
            : null,
        total_price: formData.totalPrice || null,
        order_num: formData.orderNum || null,
        other_requirements: formData.otherRequirements,
        subcontracting_not_accepted: formData.subcontractingNotAccepted,
        report_seals: formData.reportSeals,
        delivery_days_after_receipt: formData.deliveryDays !== ''
          ? Number(formData.deliveryDays)
          : null
      },

      // 增值税 & 报告基本信息
      vatType: formData.vatType,
      reportInfo: {
        type: formData.reportType,
        paper_report_shipping_type: formData.paperReportShippingType,
        report_additional_info: formData.reportAdditionalInfo || null,
        header_type: formData.reportHeader || null,
        header_other: formData.reportHeader === '2'
          ? formData.reportHeaderAdditionalInfo
          : null,
        format_type: formData.reportForm || null
      },

      // 样品处置
      sampleHandling: {
        handling_type: formData.sampleSolutionType,
        return_info:
          formData.sampleSolutionType === '3'
            ? formData.sampleReturnInfo
            : null
      },

      // 样品要求
      sampleRequirements: formData.sampleRequirements,

      // 测试项目列表
      testItems: formData.testItems.map(item => ({
        sample_name: item.sampleName,
        material: item.material || '',
        sample_type: item.sampleType === '5'
          ? item.sampleTypeCustom.trim()
          : item.sampleType,
        original_no: item.original_no || '',
        test_item: item.test_item,
        test_method: item.test_method,
        sample_preparation: item.sample_preparation,
        quantity: item.quantity,
        department_id: item.department_id,
        note: item.note || '',
        price_id: item.price_id,
        test_code: item.test_code,
        test_condition: item.test_condition,
        price_note: item.price_note
      })),

      // 指派信息
      assignmentInfo: {
        account: formData.salesPerson
      }
    };
    // 4. 发起请求
    try {
      const response = await createCommission(commissionData);
      alert(`表单提交成功！委托单号为: ${response.data.orderNum}`);
      const sampleTypeMap = {
        1: '板材',
        2: '棒材',
        3: '粉末',
        4: '液体',
        5: '其他'
      };
      const templateData = {
        // —— 订单信息 ——  
        // —— 周期类型 ——  
        serviceType1Symbol: commissionData.orderInfo.service_type === '1' ? '☑' : '☐', // 正常
        serviceType2Symbol: commissionData.orderInfo.service_type === '2' ? '☑' : '☐', // 加急
        serviceType3Symbol: commissionData.orderInfo.service_type === '3' ? '☑' : '☐', // 特急
        reportSeals1Symbol: commissionData.orderInfo.report_seals.includes('normal') ? '☑' : '☐', // 普通报告
        reportSeals2Symbol: commissionData.orderInfo.report_seals.includes('cnas') ? '☑' : '☐', // cnas
        reportSeals3Symbol: commissionData.orderInfo.report_seals.includes('cma') ? '☑' : '☐', // cma

        delivery_days_after_receipt: commissionData.orderInfo.delivery_days_after_receipt || '',
        sample_shipping_address: (commissionData.orderInfo.sample_shipping_address || ''),
        total_price: (commissionData.orderInfo.total_price || ''),
        order_num: (commissionData.orderInfo.order_num || ''),
        other_requirements: commissionData.orderInfo.other_requirements || '',
        subcontractingNotAcceptedSymbol: commissionData.orderInfo.subcontracting_not_accepted ? '☑' : '☐',

        // —— 增值税 & 报告信息 ——  
        // —— 增值税发票类型 ——  
        invoiceType1Symbol: commissionData.vatType === '1' ? '☑' : '☐', // 普通发票
        invoiceType2Symbol: commissionData.vatType === '2' ? '☑' : '☐', // 专用发票
        // —— 报告文档（多选）——  
        reportContent1Symbol: commissionData.reportInfo.type.includes(1) ? '☑' : '☐',
        reportContent2Symbol: commissionData.reportInfo.type.includes(2) ? '☑' : '☐',
        reportContent3Symbol: commissionData.reportInfo.type.includes(3) ? '☑' : '☐',
        reportContent4Symbol: commissionData.reportInfo.type.includes(4) ? '☑' : '☐',
        reportContent5Symbol: commissionData.reportInfo.type.includes(5) ? '☑' : '☐',
        reportContent6Symbol: commissionData.reportInfo.type.includes(6) ? '☑' : '☐',
        // —— 纸质版报告寄送地址 ——  
        paperReportType1Symbol: commissionData.reportInfo.paper_report_shipping_type === '1' ? '☑' : '☐',
        paperReportType2Symbol: commissionData.reportInfo.paper_report_shipping_type === '2' ? '☑' : '☐',
        paperReportType3Symbol: commissionData.reportInfo.paper_report_shipping_type === '3' ? '☑' : '☐',
        // —— 报告抬头 ——  
        headerType1Symbol: commissionData.reportInfo.header_type === '1' ? '☑' : '☐',
        headerType2Symbol: commissionData.reportInfo.header_type === '2' ? '☑' : '☐',

        // —— 报告版式 ——  
        reportForm1Symbol: commissionData.reportInfo.format_type === '1' ? '☑' : '☐',
        reportForm2Symbol: commissionData.reportInfo.format_type === '2' ? '☑' : '☐',

        report_additional_info: (commissionData.reportInfo.report_additional_info || ''),
        header_additional_info: (commissionData.reportInfo.header_other || ''),
        // —— 样品处置 ——  
        sampleHandlingType1Symbol: commissionData.sampleHandling.handling_type === '1' ? '☑' : '☐',
        sampleHandlingType2Symbol: commissionData.sampleHandling.handling_type === '2' ? '☑' : '☐',
        sampleHandlingType3Symbol: commissionData.sampleHandling.handling_type === '3' ? '☑' : '☐',
        sampleHandlingType4Symbol: commissionData.sampleHandling.handling_type === '4' ? '☑' : '☐',

        // —— 嵌套：仅当 handling_type === '3' 时有意义 ——  
        returnOptionSameSymbol: commissionData.sampleHandling.return_info?.returnAddressOption === 'same' ? '☑' : '☐',
        returnOptionOtherSymbol: commissionData.sampleHandling.return_info?.returnAddressOption === 'other' ? '☑' : '☐',
        return_address: commissionData.sampleHandling.return_info?.returnAddress || '',


        // —— 样品要求 ——  
        hazardSafetySymbol: commissionData.sampleRequirements.hazards.includes('Safety') ? '☑' : '☐',
        hazardFlammabilitySymbol: commissionData.sampleRequirements.hazards.includes('Flammability') ? '☑' : '☐',
        hazardIrritationSymbol: commissionData.sampleRequirements.hazards.includes('Irritation') ? '☑' : '☐',
        hazardVolatilitySymbol: commissionData.sampleRequirements.hazards.includes('Volatility') ? '☑' : '☐',
        hazardFragileSymbol: commissionData.sampleRequirements.hazards.includes('Fragile') ? '☑' : '☐',
        hazardOtherSymbol: commissionData.sampleRequirements.hazards.includes('Other') ? '☑' : '☐',

        hazard_other: (commissionData.sampleRequirements.hazardOther || ''),

        // —— 样品磁性 Sample magnetism ——  
        magnetismNonMagneticSymbol: commissionData.sampleRequirements.magnetism === 'Non-magnetic' ? '☑' : '☐',
        magnetismWeakMagneticSymbol: commissionData.sampleRequirements.magnetism === 'Weak-magnetic' ? '☑' : '☐',
        magnetismStrongMagneticSymbol: commissionData.sampleRequirements.magnetism === 'Strong-magnetic' ? '☑' : '☐',
        magnetismUnknownSymbol: commissionData.sampleRequirements.magnetism === 'Unknown' ? '☑' : '☐',

        // —— 样品导电性 Sample conductivity ——  
        conductivityConductorSymbol: commissionData.sampleRequirements.conductivity === 'Conductor' ? '☑' : '☐',
        conductivitySemiconductorSymbol: commissionData.sampleRequirements.conductivity === 'Semiconductor' ? '☑' : '☐',
        conductivityInsulatorSymbol: commissionData.sampleRequirements.conductivity === 'Insulator' ? '☑' : '☐',
        conductivityUnknownSymbol: commissionData.sampleRequirements.conductivity === 'Unknown' ? '☑' : '☐',

        // —— “是否可以破坏” Breakable ——  
        breakableYesSymbol: commissionData.sampleRequirements.breakable === 'yes' ? '☑' : '☐',
        breakableNoSymbol: commissionData.sampleRequirements.breakable === 'no' ? '☑' : '☐',

        // —— “是否孤品” Brittle ——  
        brittleYesSymbol: commissionData.sampleRequirements.brittle === 'yes' ? '☑' : '☐',
        brittleNoSymbol: commissionData.sampleRequirements.brittle === 'no' ? '☑' : '☐',

        // —— 指派信息 ——  
        sales_name: salesName,
        sales_email: salesEmail,
        sales_phone: salesPhone,

        // —— 检测项目列表 ——  
        testItems: commissionData.testItems.map(item => ({
          ...item,
          material: item.material.trim(),
          // sampleTypeLabel: sampleTypeMap[item.sample_type] || '',
          sampleTypeLabel: sampleTypeMap[item.sample_type] || item.sample_type || '',
          samplePrepYesSymbol: item.sample_preparation === 1 ? '☑' : '☐',
          samplePrepNoSymbol: item.sample_preparation === 0 ? '☑' : '☐',
        })),

        // —— 客户信息 ——  
        customer_name: (selectedCustomer.customer_name || ''),
        customer_address: (selectedCustomer.customer_address || ''),
        customer_contactName: (selectedCustomer.contact_name || ''),
        customer_contactEmail: (selectedCustomer.contact_email || ''),
        customer_contactPhone: (selectedCustomer.contact_phone_num || ''),

        // —— 付款方信息 ——  
        payer_name: (selectedPayer.payer_name || ''),
        payer_address: (selectedPayer.payer_address || ''),
        payer_contactName: (selectedPayer.payer_contact_name || ''),
        payer_contactEmail: (selectedPayer.payer_contact_email || ''),
        payer_contactPhone: (selectedPayer.payer_contact_phone_num || ''),
        payer_bankName: (selectedPayer.bank_name || ''),
        payer_taxNumber: (selectedPayer.tax_number || ''),
        payer_bankAccount: (selectedPayer.bank_account || '')
      };

      // 3) 调用后端 /documents 接口，拿到 Word 二进制
      const docRes = await generateDocument(templateData);
      const commissionBlob = new Blob([docRes.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      const commissionObjUrl = URL.createObjectURL(commissionBlob);


      const hasDept = id => commissionData.testItems.some(i => String(i.department_id) === String(id));

      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const receiptDate = `${yyyy}-${mm}-${dd}`; // 格式：2025-05-15

      const machiningItems = [];
      const mechanicsItems = [];
      const microItems = [];
      const physchemItems = [];

      commissionData.testItems.forEach((item, idx) => {
        // 整理成统一格式
        const [namePart, condPart] = (item.test_item || '').split(' - ').map(s => s.trim());
        const row = {
          idx: idx + 1,
          sample_code: `${response.data.orderNum} - ${String(idx + 1).padStart(3, '0')}`,
          test_item: namePart || '',
          project_code: item.test_code
            ? (condPart ? `${item.test_code}-${condPart}` : item.test_code)
            : '',
          method: item.test_method,
          quantity: item.quantity,
          note: item.note || '',
          original_no: item.original_no,
          sample_name: item.sample_name
        };

        if (item.test_code && item.test_code.startsWith('LX')) {
          machiningItems.push(row);
        } else {
          switch (String(item.department_id)) {
            case '3': mechanicsItems.push(row); break;
            case '1': microItems.push(row); break;
            case '2': physchemItems.push(row); break;
            // 其他部门忽略
            default: break;
          }
        }
      });

      const flowData = {
        order_num: response.data.orderNum,
        machiningCenterSymbol: machiningItems.length > 0 ? '☑' : '☐',
        mechanicsSymbol: hasDept(3) ? '☑' : '☐',
        microSymbol: hasDept(1) ? '☑' : '☐',
        physchemSymbol: hasDept(2) ? '☑' : '☐',
        sampleReceivedDate: receiptDate,
        showMechanicsTable: hasDept(3),
        showMicroTable: hasDept(1),
        showPhyschemTable: hasDept(2),
        // 报告形式（多选）
        reportContent1Symbol: commissionData.reportInfo.type.includes(1) ? '☑' : '☐',
        reportContent2Symbol: commissionData.reportInfo.type.includes(2) ? '☑' : '☐',
        reportContent3Symbol: commissionData.reportInfo.type.includes(3) ? '☑' : '☐',
        reportContent6Symbol: commissionData.reportInfo.type.includes(6) ? '☑' : '☐',

        reportSeals1Symbol: commissionData.orderInfo.report_seals.includes('normal') ? '☑' : '☐', // 普通报告
        reportSeals2Symbol: commissionData.orderInfo.report_seals.includes('cnas') ? '☑' : '☐', // cnas
        reportSeals3Symbol: commissionData.orderInfo.report_seals.includes('cma') ? '☑' : '☐', // cma

        // —— 报告版式 ——  
        reportForm1Symbol: commissionData.reportInfo.format_type === '1' ? '☑' : '☐',
        reportForm2Symbol: commissionData.reportInfo.format_type === '2' ? '☑' : '☐',

        // —— 报告抬头 ——  
        headerType1Symbol: commissionData.reportInfo.header_type === '1' ? '☑' : '☐',
        headerType2Symbol: commissionData.reportInfo.header_type === '2' ? '☑' : '☐',
        header_additional_info: (commissionData.reportInfo.header_other || ''),

        // 测试时效
        serviceType1Symbol: commissionData.orderInfo.service_type === '1' ? '☑' : '☐',
        serviceType2Symbol: commissionData.orderInfo.service_type === '2' ? '☑' : '☐',
        serviceType3Symbol: commissionData.orderInfo.service_type === '3' ? '☑' : '☐',
        delivery_days_after_receipt: commissionData.orderInfo.delivery_days_after_receipt,
        // “样品退回”
        returnNoSymbol: commissionData.sampleHandling.handling_type === '1' ? '☑' : '☐',  // 不退
        returnPickupSymbol: commissionData.sampleHandling.handling_type === '2' ? '☑' : '☐',  // 自取
        returnMailSymbol: commissionData.sampleHandling.handling_type === '3' ? '☑' : '☐',  // 寄回
        other_requirements: (commissionData.orderInfo.other_requirements || ''),


        hazardSafetySymbol: commissionData.sampleRequirements.hazards.includes('Safety')
          ? '☑ 无危险性'
          : null,
        hazardFlammabilitySymbol: commissionData.sampleRequirements.hazards.includes('Flammability')
          ? '☑ 易燃易爆'
          : null,
        hazardIrritationSymbol: commissionData.sampleRequirements.hazards.includes('Irritation')
          ? '☑ 刺激性'
          : null,
        hazardVolatilitySymbol: commissionData.sampleRequirements.hazards.includes('Volatility')
          ? '☑ 易挥发'
          : null,
        hazardFragileSymbol: commissionData.sampleRequirements.hazards.includes('Fragile')
          ? '☑ 易碎'
          : null,
        hazardOtherSymbol: commissionData.sampleRequirements.hazards.includes('Other')
          ? `☑ 其他: ${commissionData.sampleRequirements.hazardOther}`
          : null,
        magnetismNonMagneticSymbol: commissionData.sampleRequirements.magnetism === 'Non-magnetic'
          ? '☑ 无磁'
          : null,
        magnetismWeakMagneticSymbol: commissionData.sampleRequirements.magnetism === 'Weak-magnetic'
          ? '☑ 弱磁'
          : null,
        magnetismStrongMagneticSymbol: commissionData.sampleRequirements.magnetism === 'Strong-magnetic'
          ? '☑ 强磁'
          : null,
        magnetismUnknownSymbol: commissionData.sampleRequirements.magnetism === 'Unknown'
          ? '☑ 未知'
          : null,
        conductivityConductorSymbol: commissionData.sampleRequirements.conductivity === 'Conductor'
          ? '☑ 导体'
          : null,
        conductivitySemiconductorSymbol: commissionData.sampleRequirements.conductivity === 'Semiconductor'
          ? '☑ 半导体'
          : null,
        conductivityInsulatorSymbol: commissionData.sampleRequirements.conductivity === 'Insulator'
          ? '☑ 绝缘体'
          : null,
        conductivityUnknownSymbol: commissionData.sampleRequirements.conductivity === 'Unknown'
          ? '☑ 未知'
          : null,
        breakableYesSymbol: commissionData.sampleRequirements.breakable === 'yes'
          ? '☑ 是'
          : null,

        brittleYesSymbol: commissionData.sampleRequirements.brittle === 'yes'
          ? '☑ 是'
          : null,
        brittleNoSymbol: commissionData.sampleRequirements.brittle === 'no'
          ? '☑ 否'
          : null,

        // 项目负责人留空
        projectLeader: '',
        // 流转表格中的测试信息列表
        machiningItems,
        mechanicsItems,
        microItems,
        physchemItems,
      };

      const orderNum = response.data.orderNum;
      const custName = selectedCustomer.customer_name;
      const contactName = selectedCustomer.contact_name;
      // 拼好要用作下载的文件名
      const cName = `${orderNum}-${custName}-${contactName}.docx`;
      const fName = `${orderNum}.docx`;
      // 赋值到状态
      setCommissionFileName(cName);
      setFlowFileName(fName);

      const flowRes = await generateSampleFlow(flowData);
      const flowBlob = new Blob([flowRes.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const flowObjUrl = window.URL.createObjectURL(flowBlob);
      setCommissionUrl(commissionObjUrl);
      setFlowUrl(flowObjUrl);

      setShowDownloadModal(true);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        '服务器出现错误，请重试';
      alert(msg);
      console.error('Creating commission Error:', error);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    try {
      prefillPayment(customer.customer_id)
        .then(response => {
          if (response.data.length > 0) {
            setPrefillPayers(response.data)
            setShowPrefillModal(true);
          }
          else {
            setShowCustomerModal(false);
          }
        })
        .catch(error => {
          console.error('拉取付款方信息失败:', error);
        });
    } catch (error) {
      console.error('拉取付款方信息失败:', error);
    }
  };

  const handlePayerSelect = (payer) => {
    setSelectedPayer(payer);
    setShowPayerModal(false);
  };

  const handlePrefillYes = (payer) => {
    setSelectedPayer(payer);
    setShowCustomerModal(false);
    setShowPrefillModal(false);

  };

  const handlePrefillNo = () => {
    setShowCustomerModal(false);
    setShowPrefillModal(false);
  };
  return (
    <div>
      <img src="/JITRI-logo3.png" alt="logo"></img>
      <button type="button" onClick={handleBack} className='form-back'>返回首页</button>
      <h1>
        检测委托合同<br></br>
        Testing Application Contract
      </h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="orderNum">
          任务编号 Task number:
          <input
            type="text"
            id="orderNum"
            name="orderNum"
            value={formData.orderNum}
            onChange={handleInputChange}
            placeholder="请输入委托单号或留空自动生成"
          />
        </label>
        <button type="button" onClick={handlePrefill} style={{ height: 32 }}>
          预填
        </button>
        <h3>服务方信息 Receiver Information</h3>

        <p>Receiver Name：集萃新材料研发有限公司</p>

        <label>联系人 Contact：&nbsp;<span style={{ color: 'red' }}>*</span></label>
        <select
          name="salesPerson"
          value={formData.salesPerson}
          onChange={handleSalespersonChange}
        >
          <option value="">请选择业务员/空值</option>
          {salespersons.map(person => (
            <option key={person.account} value={person.account}>
              {person.name} ({person.account})
            </option>
          ))}
        </select>

        {salesEmail && <p><strong>邮箱 E-mail：{salesEmail}</strong></p>}
        {salesPhone && <p><strong>联系电话 Tel：{salesPhone}</strong></p>}

        <p>地址 Address：江苏省苏州市相城区青龙港路286号1号楼</p>

        <p>
          加★内容为必填项The field marked with★must be filled.
        </p>
        <h3>委托方信息 Applicant Information&nbsp;<span style={{ color: 'red' }}>*</span></h3>
        <div class="block">
          <button type="button" onClick={() => setShowCustomerModal(true)}>
            选择委托方
          </button>
          {selectedCustomer && (
            <div className='selected-customer-info'>
              <p>委托方名称 Customer Name：{selectedCustomer.customer_name}</p>
              <p>联系人 Contact：{selectedCustomer.contact_name}</p>
              <p>地址 Address：{selectedCustomer.customer_address}</p>
              <p>报告接收邮箱 E-mail：{selectedCustomer.contact_email}</p>
              <p>联系电话 Tel：{selectedCustomer.contact_phone_num}</p>
            </div>
          )}
          <p className='titleNote'>
            注：以上信息将显示在报告中，请仔细填写，填写语言需与报告语言一致。报告签发后修改需支付RMB 100元/份。
            <br></br>
            The above information will appear in the report. Please complete carefully in the same language as the report. A fee of RMB 100 per report will be charged for post-issuance modifications.
          </p>
        </div>

        <h3>付款方信息 Payer Information&nbsp;<span style={{ color: 'red' }}>*</span></h3>

        <div class="block">
          <fieldset>
            <legend>发票类型&nbsp;<span style={{ color: 'red' }}>*</span></legend>
            <label>
              <input type="radio" name="vatType" value="1" onChange={handleRadioChange} checked={formData.vatType === '1'} /> 增值税普通发票
            </label>
            <label>
              <input type="radio" name="vatType" value="2" onChange={handleRadioChange} checked={formData.vatType === '2'} /> 增值税专用发票
            </label>
          </fieldset>
          <button type="button" onClick={() => setShowPayerModal(true)}>
            选择付款方
          </button>
          {selectedPayer && (
            <div className="selected-payer-info">
              <p>名称 Name：{selectedPayer.payer_name}</p>
              <p>地址 Address：{selectedPayer.payer_address}</p>
              <p>电话 Tel：{selectedPayer.payer_phone_num}</p>
              <p>开户银行 Deposit Bank：{selectedPayer.bank_name}</p>
              <p>税号 Tax No.：{selectedPayer.tax_number}</p>
              <p>银行账号 Bank Account：{selectedPayer.bank_account}</p>
              <p>付款人 Payer：{selectedPayer.payer_contact_name}</p>
              <p>联系电话 Tel：{selectedPayer.payer_contact_phone_num}</p>
            </div>
          )}
        </div>

        <h3>检测信息 Test Information</h3>
        <fieldset>
          <legend>检测要求 Period Type</legend>
          <label>
            以【检测要求附录】中信息为准 Subject to the Testing Requirements Appendix
          </label>
        </fieldset>

        <fieldset>
          <legend>周期类型 Period Type&nbsp;<span style={{ color: 'red' }}>*</span></legend>
          <label>
            <input type="radio" name="serviceType" value="1" onChange={handleRadioChange} checked={formData.serviceType === '1'} /> 正常 Standard
          </label>
          <label>
            <input type="radio" name="serviceType" value="2" onChange={handleRadioChange} checked={formData.serviceType === '2'} /> 加急 Urgent（加收50%检测费用）
            Urgent (收样后3个工作日开始检测Testing will commence three working days following the receipt of the samples.)
          </label>
          <label>
            <input type="radio" name="serviceType" value="3" onChange={handleRadioChange} checked={formData.serviceType === '3'} /> 特急（加收100%检测费用）
            Standard (收样后5个工作日开始检测Testing will commence five working days following the receipt of the samples.)
          </label>

          <label style={{ display: 'block', marginTop: 8 }}>
            交付时间 Delivery time：收样后
            <input
              type="number"
              name="deliveryDays"
              min="0"
              value={formData.deliveryDays}
              onChange={handleInputChange}
              style={{ width: '4em', margin: '0 4px' }}
            />
            个工作日 ( working days after sample receipt )
          </label>
          <label>
            注：周六、周日及节假日不计入工作日Saturday, Sunday and festival days are not workdays
          </label>

        </fieldset>

        <h3>报告要求 Report Requirements</h3>
        <fieldset>
          <legend>报告文档 Report Content&nbsp;<span style={{ color: 'red' }}>*</span></legend>
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

        {!(
          formData.reportType.length === 1 &&
          formData.reportType.includes(1)
        ) && (
            <>
              <fieldset>
                <legend>报告标识章 Report Seals</legend>
                <label style={{ marginRight: 12 }}>
                  <input
                    type="checkbox"
                    value="normal"
                    checked={formData.reportSeals.includes('normal')}
                    onChange={handleReportSealsChange}
                  />
                  普通报告 Normal report
                </label>
                <label style={{ marginRight: 12 }}>
                  <input
                    type="checkbox"
                    value="cnas"
                    checked={formData.reportSeals.includes('cnas')}
                    onChange={handleReportSealsChange}
                  />
                  CNAS
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="cma"
                    checked={formData.reportSeals.includes('cma')}
                    onChange={handleReportSealsChange}
                  />
                  CMA
                </label>
              </fieldset>

              <fieldset>
                <legend>纸质版报告寄送地址 Paper delivery address</legend>
                {/* 例如邮寄选项 */}
                <label>
                  <input
                    type="radio"
                    name="paperReportShippingType"
                    value="1"
                    onChange={handleRadioChange}
                    checked={formData.paperReportShippingType === '1'}
                  /> 邮寄到委托方 To the applicant
                </label>
                <label>
                  <input
                    type="radio"
                    name="paperReportShippingType"
                    value="2"
                    onChange={handleRadioChange}
                    checked={formData.paperReportShippingType === '2'}
                  /> 邮寄到付款方 To the payer
                </label>
                <label>
                  <input
                    type="radio"
                    name="paperReportShippingType"
                    value="3"
                    onChange={handleRadioChange}
                    checked={formData.paperReportShippingType === '3'}
                  /> 其他 Others
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


              {/* 报告抬头 */}
              <fieldset>
                <legend>报告抬头 Report Header&nbsp;<span style={{ color: 'red' }}>*</span></legend>
                {Object.keys(reportHeaderOptions).map(option => (
                  <label key={option}>
                    <input
                      type="radio"
                      name="reportHeader"
                      value={reportHeaderOptions[option]}
                      onChange={handleReportHeaderChange}
                      checked={formData.reportHeader === String(reportHeaderOptions[option])}
                    /> {option}
                  </label>
                ))}
                {/* 如果选了“其他”，显示一行输入框 */}
                {formData.reportHeader === '2' && (
                  <label style={{ display: 'block', marginTop: 8 }}>
                    其他(地址/收件人/电话)Others
                    <input
                      type="text"
                      name="reportHeaderAdditionalInfo"
                      value={formData.reportHeaderAdditionalInfo}
                      onChange={handleInputChange}
                      style={{ width: '60%', marginLeft: 4 }}
                      placeholder="请输入补充信息"
                    />
                  </label>
                )}
              </fieldset>



              {/* 报告版式 */}
              <fieldset>
                <legend>报告版式 Report Format&nbsp;<span style={{ color: 'red' }}>*</span></legend>
                {Object.keys(reportFormOptions).map(option => (
                  <label key={option}>
                    <input
                      type="radio"
                      name="reportForm"
                      value={reportFormOptions[option]}
                      onChange={handleReportFormChange}
                      checked={formData.reportForm === String(reportFormOptions[option])}
                    /> {option}
                  </label>
                ))}
              </fieldset>
            </>
          )}


        <fieldset>
          <p>
            <strong>重要说明Important Notes:</strong>
            <br></br>
            1.JITRIAMRI仅对来样检测结果负责，不承担样品真实性、客户指定方法缺陷导致的误差责任。委托方须于报告签发15日内提出异议，可凭余样申请复检（结果无误则正常收费），超期未异议视为验收合格。样品销毁/退回后不再受理复检，超期样品处置不另行通知，委托方信息变更未提前5日书面告知的自行承担后果。JITRIAMRI is solely responsible for the test results of submitted samples, not for sample authenticity or defects in client-specified methodologies. Retest requests must be submitted within 15 days of report delivery, subject to retained sample availability; standard fees apply if original results are confirmed. Retests after sample disposal/return or post-deadline will not be processed. Uncontested reports within 15 days are deemed accepted. Post-deadline sample disposal occurs without notice. Clients bear risks for un-updated information without 5-day prior written notice.
            <br></br>
            2.委托方须于报告签发后30日内支付服务款，超期15日未付视为违约，受托方可暂停服务并追讨费用及法律追偿（含诉讼费、保全费、律师费）。检测验收或报告签发15日内未提出异议即视为确认，不得以异议为由拒付。The Client shall settle payment within 30 days post-report issuance. Delinquency exceeding 15 days constitutes default, entitling the Service Provider to suspend services, reclaim fees, and pursue legal recovery (including litigation costs, preservation bonds, and attorney fees). Full payment obligation arises upon either: (a) testing acceptance, or (b) 15-day non-dispute period post-report issuance. Disputes may not be invoked to withhold payment.
            <br></br>
          </p>
        </fieldset>

        <h3>检测项目</h3>
        <div className="test-item-table-wrapper">
          <table className="test-item-table">
            <thead>
              <tr>

                <th className="num">序号</th>
                <th>样品名称<span style={{ color: 'red' }}>*</span><br></br>Sample Name</th>
                <th>材质<span style={{ color: 'red' }}>*</span><br></br>Material</th>
                <th>样品状态<span style={{ color: 'red' }}>*</span><br></br>Sample Status</th>
                <th>样品原号<br></br>Sample No.</th>
                <th>价格备注<br />Price Note</th>
                <th>检测项目<span style={{ color: 'red' }}>*</span><br></br>Test Items</th>
                <th>检测标准<span style={{ color: 'red' }}>*</span><br></br>Methods</th>
                <th>制样<span style={{ color: 'red' }}>*</span><br></br>Sample preparation</th>
                <th>数量<span style={{ color: 'red' }}>*</span><br></br>Qty</th>
                <th>时长(/天)</th>
                <th>所属部门<span style={{ color: 'red' }}>*</span></th>
                <th>备注<br></br>Remarks</th>
                <th className="action-col">操作</th>
              </tr>
            </thead>
            <tbody>
              {formData.testItems.map((item, index) => (
                <tr key={index}>
                  <td className="num">{index + 1}</td>
                  {/* 样品名称 */}
                  <td>
                    <input
                      type="text"
                      value={item.sampleName}
                      onChange={e => handleTestItemChange(index, 'sampleName', e.target.value)}
                    />
                  </td>

                  {/* 材质 */}
                  <td>
                    <input
                      type="text"
                      value={item.material}
                      onChange={e => handleTestItemChange(index, 'material', e.target.value)}
                    />
                  </td>

                  {/* 样品类型 */}
                  <td>
                    {String(item.sampleType) === '5' ? (
                      <input
                        type="text"
                        placeholder="请输入"
                        value={item.sampleTypeCustom || ''}
                        onChange={e => handleTestItemChange(index, 'sampleTypeCustom', e.target.value)}
                      />
                    ) : (
                      <select
                        value={item.sampleType}
                        onChange={e => handleTestItemChange(index, 'sampleType', e.target.value)}
                      >
                        <option value="" disabled>请选择</option>
                        {Object.entries(typeMappings.sampleType).map(([label, val]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    )}
                  </td>

                  <td><input type="text" value={item.original_no} onChange={(e) => handleTestItemChange(index, 'original_no', e.target.value)} /></td>
                  <td>
                    <input
                      type="text"
                      value={item.price_note || ''}
                      onChange={e => handleTestItemChange(index, 'price_note', e.target.value)}
                      placeholder="可选"
                    />
                  </td>
                  {(item.price_id && item.test_condition !== '其他') ? (
                    <td className='selected-price'>
                      <span>{item.test_item}</span>
                      <span>(单价{item.unit_price}元)</span>

                    </td>
                  ) : (
                    <td><input type="text" value={item.test_item} onChange={(e) => handleTestItemChange(index, 'test_item', e.target.value)} /></td>

                  )}
                  <td><input type="text" value={item.test_method} onChange={(e) => handleTestItemChange(index, 'test_method', e.target.value)} /></td>
                  <td>
                    <select
                      value={item.sample_preparation}
                      onChange={e => handleTestItemChange(index, 'sample_preparation', e.target.value === '' ? '' : Number(e.target.value))}
                    >
                      <option value="" disabled>--请选择--</option>
                      <option value="1">是 Yes</option>
                      <option value="0">否 No</option>
                    </select>
                  </td>
                  <td><input type="number" min="0" value={item.quantity} onChange={(e) => handleTestItemChange(index, 'quantity', e.target.value)} /></td>
                  <td><input type="number" min="0" style={{ width: 50 + 'px' }} value={item.deadline} onChange={(e) => handleTestItemChange(index, 'deadline', e.target.value)} /></td>

                  {item.price_id ? (
                    <td className='selected-price'>
                      <span>{departments.find(dept => dept.department_id === item.department_id)?.department_name || '未知部门'}</span>
                    </td>
                  ) : (
                    <td>
                      <select value={item.department_id || ""} onChange={e => handleDepartmentChange(index, e.target.value)}>
                        <option value="" disabled>---请选择---</option>
                        {departments.map(dept => (
                          <option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td><input type="text" value={item.note} onChange={(e) => handleTestItemChange(index, 'note', e.target.value)} /></td>
                  <td className="action-col add-remove-buttons">
                    <button
                      type="button"
                      className="copy-button"
                      style={{ marginRight: 4 }}
                      onClick={() => duplicateTestItem(index)}
                    >
                      复制
                    </button>
                    <button type="button" className="add-button" onClick={() => {
                      setSelectedTestIndex(index);  // Store the current row index
                      setShowPriceModal(true);      // Show the modal
                    }}>
                      选择项目
                    </button>
                    <button type="button" className="remove-button" onClick={() => removeTestItem(index)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="add-test-item-button">
          <button type="button" onClick={addTestItem}>
            添加新项目
          </button>
        </div>
        <div className="block">
          <label>
            其他要求 Other Requirements:
            <input
              type="text"
              name="otherRequirements"
              value={formData.otherRequirements}
              onChange={handleOtherRequirementsChange}
              placeholder="填写其他特殊要求"
            />
          </label>
          <p>
            注Notes：<br></br>
            1.默认不出具评判结论；The judgment conclusion is not issued by default.<br></br>
            2.若客户未指明测试标准及年代号，则默认为客户接受我方集萃新材料研发有限公司(以下简称JITRIAMRI)推荐的测试方法及最新标准；If the customer does not specify the test standards and the year, it will be deemed by default that the customer accepts the test methods and the latest standards recommended by JITRIAMRI.
            <br></br>
            3.
            <input
              type="checkbox"
              name="subcontractingNotAccepted"
              checked={formData.subcontractingNotAccepted}
              onChange={handleSubcontractingChange}
            />不接受分包 Subcontracting is not accepted；如未选择，视为接受分包；If not selected, it will be regarded as acceptance of subcontracting.
            <br></br>
            4.若需要CMA、CNAS章或其他测试要求，请在其他要求中写明(可另附页)。If CMA, CNAS stamps or other testing requirements are needed, please specify them in the other requirements.
          </p>
        </div>

        <h3>样品要求 Sample Requirements</h3>

        <fieldset>
          <legend>样品信息 Sample Infomation</legend>
          {/* 危险特性 */}
          <div className="sample-section">
            <p>危险特性 Hazard:&nbsp;<span style={{ color: 'red' }}>*</span></p>
            {hazardOptions.map(opt => (
              <label key={opt.key} style={{ marginRight: 12 }}>
                <input
                  type="checkbox"
                  checked={formData.sampleRequirements.hazards.includes(opt.key)}
                  onChange={e => handleHazardChange(opt.key, e.target.checked)}
                /> {opt.label}
              </label>
            ))}
            <label style={{ display: 'block', marginTop: 8 }}>
              其他 Others:
              <input
                type="text"
                value={formData.sampleRequirements.hazardOther}
                onChange={e => handleNestedChange('sampleRequirements', 'hazardOther', e.target.value)}
                placeholder="请输入其他危险特性"
                style={{ marginLeft: 4, width: '40%' }}
              />
            </label>
          </div>

          <hr />

          {/* 样品磁性 */}
          <div className="sample-section">
            <p>样品磁性 Sample magnetism:&nbsp;<span style={{ color: 'red' }}>*</span></p>
            {magnetismOptions.map(opt => (
              <label key={opt.key} style={{ marginRight: 12 }}>
                <input
                  type="radio"
                  name="magnetism"
                  checked={formData.sampleRequirements.magnetism === opt.key}
                  onChange={() => handleNestedChange('sampleRequirements', 'magnetism', opt.key)}
                /> {opt.label}
              </label>
            ))}
          </div>

          <hr />

          {/* 导电性 */}
          <div className="sample-section">
            <p>样品导电性 Sample conductivity:&nbsp;<span style={{ color: 'red' }}>*</span></p>
            {conductivityOptions.map(opt => (
              <label key={opt.key} style={{ marginRight: 12 }}>
                <input
                  type="radio"
                  name="conductivity"
                  checked={formData.sampleRequirements.conductivity === opt.key}
                  onChange={() => handleNestedChange('sampleRequirements', 'conductivity', opt.key)}
                /> {opt.label}
              </label>
            ))}
          </div>

          <hr />

          {/* 2. 是否可以破坏 */}
          <div className="sample-section">
            <p>2. 是否可以破坏 Can it be broken:&nbsp;<span style={{ color: 'red' }}>*</span></p>
            <label style={{ marginRight: 12 }}>
              <input
                type="radio"
                name="breakable"
                checked={formData.sampleRequirements.breakable === 'yes'}
                onChange={() => handleNestedChange('sampleRequirements', 'breakable', 'yes')}
              /> 是 Yes
            </label>
            <label>
              <input
                type="radio"
                name="breakable"
                checked={formData.sampleRequirements.breakable === 'no'}
                onChange={() => handleNestedChange('sampleRequirements', 'breakable', 'no')}
              /> 否 No
            </label>
          </div>

          <hr />

          {/* 3. 是否孤品 */}
          <div className="sample-section">
            <p>3. 是否孤品 (As shown) :&nbsp;<span style={{ color: 'red' }}>*</span></p>
            <label style={{ marginRight: 12 }}>
              <input
                type="radio"
                name="brittle"
                checked={formData.sampleRequirements.brittle === 'yes'}
                onChange={() => handleNestedChange('sampleRequirements', 'brittle', 'yes')}
              /> 是 Yes
            </label>
            <label>
              <input
                type="radio"
                name="brittle"
                checked={formData.sampleRequirements.brittle === 'no'}
                onChange={() => handleNestedChange('sampleRequirements', 'brittle', 'no')}
              /> 否 No
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>余样处置 Sample Handling&nbsp;<span style={{ color: 'red' }}>*</span></legend>
          {/* 1. 服务方处理 */}
          <label>
            <input
              type="radio"
              name="sampleSolutionType"
              value="1"
              onChange={handleRadioChange}
              checked={formData.sampleSolutionType === '1'}
            />
            由服务方处理（样品留存90天，逾期销毁）Disposed after retention in JITRIAMRI for 3 months.
          </label>

          {/* 2. 委托方自取 */}
          <label>
            <input
              type="radio"
              name="sampleSolutionType"
              value="2"
              onChange={handleRadioChange}
              checked={formData.sampleSolutionType === '2'}
            />
            委托方自取 Taking back during retention period by applicant.
          </label>

          {/* 3. 服务方协助寄回 */}
          <label>
            <input
              type="radio"
              name="sampleSolutionType"
              value="3"
              onChange={handleRadioChange}
              checked={formData.sampleSolutionType === '3'}
            />
            服务方协助寄回 (到付) Return (Charge applicant)
          </label>

          {/* 嵌套：只有选“服务方协助寄回”时才显示 */}
          {formData.sampleSolutionType === '3' && (
            <div className="nested-return-address" style={{ paddingLeft: 20 }}>
              <label>
                <input
                  type="radio"
                  name="returnAddressOption"
                  value="same"
                  onChange={e => handleNestedChange('sampleReturnInfo', 'returnAddressOption', e.target.value)}
                  checked={formData.sampleReturnInfo.returnAddressOption === 'same'}
                />
                同委托方信息 Same as applicant
              </label>
              <label>
                <input
                  type="radio"
                  name="returnAddressOption"
                  value="other"
                  onChange={e => handleNestedChange('sampleReturnInfo', 'returnAddressOption', e.target.value)}
                  checked={formData.sampleReturnInfo.returnAddressOption === 'other'}
                />
                其他 Others (Address/Recipient/Tel):
              </label>
              {formData.sampleReturnInfo.returnAddressOption === 'other' && (
                <input
                  type="text"
                  name="sampleShippingAddress"
                  placeholder="填写退回地址/收件人/电话"
                  value={formData.sampleShippingAddress}
                  onChange={handleInputChange}
                  style={{ display: 'block', marginTop: 4 }}
                />
              )}
            </div>
          )}

          {/* 4. 无剩余样品 */}
          <label>
            <input
              type="radio"
              name="sampleSolutionType"
              value="4"
              onChange={handleRadioChange}
              checked={formData.sampleSolutionType === '4'}
            />
            无剩余样品 No Sample residue.
          </label>
        </fieldset>

        {/* <fieldset>
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
              <option value="">请选择业务员/空值</option>
              {salespersons.map((person) => (
                <option key={person.account} value={person.account}>{`${person.name} (${person.account})`}</option>
              ))}
            </select>
          </label>
        </fieldset> */}

        <button type="submit" class="submit">提交表单并生成Word</button>



        {/* Customer Modal */}
        {showCustomerModal && (
          <div className="modal">
            <div className="modal-content">
              <h2 className="modal-title">委托方信息</h2>
              <div className='search-box'>

                <span>搜索委托方</span>
                <input
                  type="text"
                  value={searchCustomerNameTerm}
                  onChange={(e) => setSearchCustomerNameTerm(e.target.value)}
                  placeholder="搜索委托方"
                  className="search-input"

                />
                <span>搜索联系人</span>
                <input
                  type="text"
                  value={searchContactNameTerm}
                  onChange={(e) => setSearchContactNameTerm(e.target.value)}
                  placeholder="搜索联系人"
                  className="search-input"

                />
                <span>搜索联系人电话</span>
                <input
                  type="text"
                  value={searchContactPhoneTerm}
                  onChange={(e) => setSearchContactPhoneTerm(e.target.value)}
                  placeholder="搜索联系人电话"
                  className="search-input"

                />
              </div>

              <div className="table-container">
                <table className="payer-table">
                  <thead>
                    <tr>
                      <th className='title-id'>ID</th>

                      <th>委托方名称</th>
                      <th>地址</th>
                      <th>联系人名称</th>
                      <th>联系人电话</th>
                      <th>联系人邮箱</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(customer => (
                      <tr key={customer.id}>
                        <td className='title-id'>{customer.customer_id}</td>

                        <td>{customer.customer_name}</td>
                        <td>{customer.customer_address}</td>
                        <td>{customer.contact_name}</td>
                        <td>{customer.contact_phone_num}</td>
                        <td>{customer.contact_email}</td>
                        <td>
                          <button type="button" onClick={() => handleCustomerSelect(customer)}>选择</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => setShowCustomerModal(false)}>关闭</button>
            </div>
          </div>
        )}

        {/* Payer Modal */}
        {showPayerModal && (
          <div className="modal">
            <div className="modal-content">
              {/* Modal Title */}
              <h2 className="modal-title">付款方信息</h2>
              <div className='search-box'>
                <span>搜索付款方</span>
                <input
                  type="text"
                  value={searchPayerNameTerm}
                  onChange={(e) => setSearchPayerNameTerm(e.target.value)}
                  placeholder="搜索付款方"
                  className="search-input"

                />
                <span>搜索联系人/导师</span>
                <input
                  type="text"
                  value={searchPayerContactNameTerm}
                  onChange={(e) => setSearchPayerContactNameTerm(e.target.value)}
                  placeholder="搜索联系人/导师"
                  className="search-input"

                />
                <span>搜索联系人电话</span>
                <input
                  type="text"
                  value={searchPayerContactPhoneTerm}
                  onChange={(e) => setSearchPayerContactPhoneTerm(e.target.value)}
                  placeholder="搜索联系人电话"
                  className="search-input"

                />

              </div>

              <div className="table-container">
                <table className="payer-table">
                  <thead>
                    <tr>
                      <th className='title-id'>ID</th>
                      <th>付款方名称</th>
                      <th>地址</th>
                      <th>联系人/导师</th>
                      <th>联系人电话</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>

                    {payers.map(payer => (
                      <tr key={payer.payment_id}>
                        <td className='title-id'>{payer.payment_id}</td>
                        <td>{payer.payer_name}</td>
                        <td>{payer.payer_address}</td>
                        <td>{payer.payer_contact_name}</td>
                        <td>{payer.payer_contact_phone_num}</td>
                        <td>
                          <button onClick={() => handlePayerSelect(payer)}>选择</button>
                        </td>
                      </tr>

                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => setShowPayerModal(false)}>关闭</button>
            </div>
          </div>
        )}

        {showPriceModal && (
          <div className="modal">
            <div className="modal-content">
              <h2 className="modal-title">选择检测项目</h2>
              <div className='search-box'>
                <span>搜索测试代码</span>
                <input
                  type="text"
                  value={searchTestCode}
                  onChange={(e) => setSearchTestCode(e.target.value)}
                  placeholder="输入测试代码"
                  className="search-input"
                />

                <span>搜索检测项目</span>
                <input
                  type="text"
                  value={searchTestItem}
                  onChange={(e) => setSearchTestItem(e.target.value)}
                  placeholder="输入检测项目名称"
                  className="search-input"
                />
                <span>搜索检测条件</span>
                <input
                  type="text"
                  value={searchTestCondition}
                  onChange={(e) => setSearchTestCondition(e.target.value)}
                  placeholder="输入检测条件"
                  className="search-input"
                />


              </div>

              <div className="table-container">
                <table className="payer-table">
                  <thead>
                    <tr>
                      <th className='title-id'>ID</th>
                      <th>测试代码</th>
                      <th>检测项目</th>
                      <th>检测条件</th>
                      <th>检测标准</th>
                      <th>单价</th>
                      <th>操作</th>

                    </tr>
                  </thead>
                  <tbody>
                    {priceList
                      .filter(item =>
                        item.test_item_name.includes(searchTestItem)
                        && item.test_condition.includes(searchTestCondition)
                        && item.test_code.includes(searchTestCode))
                      .map(item => (
                        <tr key={item.price_id}>
                          <td>{item.price_id}</td>
                          <td>{item.test_code}</td>
                          <td>{item.test_item_name}</td>
                          <td>{item.test_condition}</td>
                          <td>{item.test_standard}</td>
                          <td>{item.unit_price} 元</td>
                          <td>
                            <button onClick={() => handlePriceSelect(item)}>选择</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => setShowPriceModal(false)}>关闭</button>
            </div>
          </div>
        )}


        {/* 预填消息弹框 */}
        {showPrefillModal && (
          <div className="modal">
            <div className="modal-content">
              <div>
                <p>检测到该委托方已绑定了对应的付款方信息：</p>
                <table className="payer-table">
                  <thead>
                    <tr>
                      <th className='title-id'>ID</th>
                      <th>付款方名称</th>
                      <th>联系人/导师</th>
                      <th>联系人电话</th>
                    </tr>
                  </thead>
                  <tbody>

                    {prefillPayers.map(payer => (
                      <tr key={payer.payment_id}>
                        <td className='title-id'>{payer.payment_id}</td>
                        <td>{payer.payer_name}</td>
                        <td>{payer.payer_contact_name}</td>
                        <td>{payer.payer_contact_phone_num}</td>
                      </tr>

                    ))}
                  </tbody>
                </table>
              </div>
              <p>请选择是否需要预填？</p>
              <div className='decide-button'>
                <button type="button" onClick={() => handlePrefillNo()}>否，我自己选择</button>
                <button type="button" onClick={() => handlePrefillYes(prefillPayers[0])}>是，帮我预填</button>
              </div>

            </div>
          </div>
        )}



      </form>

      {showDownloadModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>文件已生成</h2>
            <p>请分别点击下面按钮下载：</p>
            <div className='decide-button'>
              <button
                onClick={() => downloadFile(commissionUrl, commissionFileName)}
              >
                下载委托单
              </button>
              <button
                onClick={() => downloadFile(flowUrl, flowFileName)}
              >
                下载流转单
              </button>
              <button
                onClick={() => {
                  // 关闭 modal 之前可以 revoke URL
                  URL.revokeObjectURL(commissionUrl);
                  URL.revokeObjectURL(flowUrl);
                  setShowDownloadModal(false);
                  window.location.href = '/';
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormPage;
