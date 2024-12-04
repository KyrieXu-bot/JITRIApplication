import React, { useState } from 'react';
import { createPayment } from '../api/api';
import { useNavigate } from 'react-router-dom';
import '../css/Customer.css'

function PaymentPage() {
    const [formData, setFormData] = useState({
        payer_name: '',
        payer_address: '',
        payer_phone_num: '',
        bank_name: '',
        tax_number: '',
        bank_account: '',
        payer_contact_name: '',
        payer_contact_phone_num: '',
        payer_contact_email: '',
        balance: '',
        area: '',
        organization: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const [responseMessage, setResponseMessage] = useState('');

    const areas = ['上海', '省内', '省外', '苏州', '相城'];
    const organizations = ['高校','集萃体系','企业','研究所']
    const handleAreaChange = (index, value) => {
        setFormData(prevState => ({
            ...prevState,
            area: value,
        }));
    };

    const handleOrgChange = (index, value) => {
        setFormData(prevState => ({
            ...prevState,
            organization: value,
        }));
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        const requiredFields = [
            'payer_name',
            'payer_contact_name',
            'payer_contact_phone_num'
        ];
        for (let field of requiredFields) {
            if (!formData[field]) {
                setErrorMessage('请填写所有必填项！');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setShowModal(true);
        }
    };

    const confirmSubmit = async () => {
        setShowModal(false);
        try {
            // Replace with your backend API URL
            const response = await createPayment(formData);
            if (response.status === 201 && response.data) {
                setResponseMessage(response.data.message); // Update the state with the success message

                // Clear form data after submission
                setFormData({
                    payer_name: '',
                    payer_address: '',
                    payer_phone_num: '',
                    bank_name: '',
                    tax_number: '',
                    bank_account: '',
                    payer_contact_name: '',
                    payer_contact_phone_num: '',
                    payer_contact_email: '',
                    area:'',
                    organization:'',
                    balance: ''
                });
            }
        } catch (error) {
            console.error('There was an error adding the customer!', error);
            setResponseMessage(`Error: ${error.message}`);
        }
    };


    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="customer-page">
            <img src="/JITRI-logo2.png" alt="logo"></img>
            <h1>新增付款方</h1>
            {errorMessage && <div className="error-message" style={{ color: 'red' }}>{errorMessage}</div>}
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>付款方信息</legend>
                    <div className='field-info'>
                        <div className="form-group">
                            <label htmlFor="payer_name">付款方名称：</label>
                            <input
                                type="text"
                                id="payer_name"
                                name="payer_name"
                                value={formData.payer_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="payer_address">付款方地址：</label>
                            <input
                                type="text"
                                id="payer_address"
                                name="payer_address"
                                value={formData.payer_address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="payer_phone_num">付款方电话：</label>
                            <input
                                type="text"
                                id="payer_phone_num"
                                name="payer_phone_num"
                                value={formData.payer_phone_num}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bank_name">开户银行：</label>
                            <input
                                type="text"
                                id="bank_name"
                                name="bank_name"
                                value={formData.bank_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tax_number">税号：</label>
                            <input
                                type="text"
                                id="tax_number"
                                name="tax_number"
                                value={formData.tax_number}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bank_account">银行账户：</label>
                            <input
                                type="text"
                                id="bank_account"
                                name="bank_account"
                                value={formData.bank_account}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="payer_contact_name">付款联系人/导师名称：</label>
                            <input
                                type="text"
                                id="payer_contact_name"
                                name="payer_contact_name"
                                value={formData.payer_contact_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="payer_contact_phone_num">付款联系人电话：</label>
                            <input
                                type="text"
                                id="payer_contact_phone_num"
                                name="payer_contact_phone_num"
                                value={formData.payer_contact_phone_num}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="payer_contact_email">付款联系人邮箱：</label>
                            <input
                                type="email"
                                id="payer_contact_email"
                                name="payer_contact_email"
                                value={formData.payer_contact_email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="area">所在区域</label>
                            <select 
                                value={formData.area || ""} 
                                onChange={e => handleAreaChange(0, e.target.value)}
                                className='area-select'
                                required
                            >
                                <option value="" disabled>---请选择---</option>
                                {areas.map((area, idx) => (
                                    <option key={idx} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="organization">单位性质</label>
                            <select 
                                value={formData.organization || ""} 
                                onChange={e => handleOrgChange(0, e.target.value)}
                                className='area-select'
                                required
                            >
                                <option value="" disabled>---请选择---</option>
                                {organizations.map((organization, idx) => (
                                    <option key={idx} value={organization}>{organization}</option>
                                ))}
                            </select>
                        </div>
                    </div>


                </fieldset>
                <fieldset>
                    <legend>余额初始充值</legend>
                    <div className='field-info'>
                        <div className="form-group">
                            <label htmlFor="balance">初始余额：</label>
                            <input
                                type="number"
                                id="balance"
                                name="balance"
                                value={formData.balance}
                                onChange={handleChange}
                                step="0.01" // 确保支持小数输入
                                min="0" // 限制输入为非负数
                            />
                        </div>
                    </div>
                </fieldset>
                <div className='customer-button-group'>
                    <button type="submit">新增付款方</button>
                    <button type="button" onClick={handleBack}>返回首页</button>
                </div>
            </form>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>确认提交</h3>
                        <p>您确定要提交这些信息吗？</p>
                        <div className="modal-buttons">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
                            <button className="btn btn-primary" onClick={confirmSubmit}>确定</button>
                        </div>
                    </div>
                </div>
            )}
            {responseMessage && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>提交成功</h3>
                        <p>{responseMessage}</p>
                        <div className="modal-buttons">
                            <button className="btn btn-primary" onClick={handleBack}>确定</button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}
export default PaymentPage;
