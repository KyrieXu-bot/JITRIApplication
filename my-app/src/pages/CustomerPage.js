import React, { useState } from 'react';
import { createCustomer } from '../api/api';
import { useNavigate } from 'react-router-dom';
import '../css/Customer.css'

function CustomerPage() {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_address: '',
        contact_name: '',
        contact_phone_num: '',
        contact_email: '',
        area: '',
        organization: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const [responseMessage, setResponseMessage] = useState('');

    const areas = ['上海', '省内', '省外', '苏州', '相城'];
    const organizations = ['高校', '集萃体系', '企业', '研究所']
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
            'customer_name',
            'contact_name',
            'contact_phone_num',
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
            const response = await createCustomer(formData);
            if (response.status === 201 && response.data) {
                setResponseMessage(response.data.message); // Update the state with the success message

                // Clear form data after submission
                setFormData({
                    customer_name: '',
                    customer_address: '',
                    contact_name: '',
                    contact_phone_num: '',
                    contact_email: '',
                    area: '',
                    organization: ''
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
            <h1>新增委托方</h1>
            {errorMessage && <div className="error-message" style={{ color: 'red' }}>{errorMessage}</div>}
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>委托方信息</legend>
                    <div className='field-info'>
                        <div className="form-group">
                            <label htmlFor="customer_name">委托方名称：</label>
                            <input
                                type="text"
                                id="customer_name"
                                name="customer_name"
                                value={formData.customer_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="customer_address">委托方地址：</label>
                            <input
                                type="text"
                                id="customer_address"
                                name="customer_address"
                                value={formData.customer_address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contact_name">联系人姓名：</label>
                            <input
                                type="text"
                                id="contact_name"
                                name="contact_name"
                                value={formData.contact_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contact_phone_num">联系人电话：</label>
                            <input
                                type="text"
                                id="contact_phone_num"
                                name="contact_phone_num"
                                value={formData.contact_phone_num}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contact_email">联系人邮箱：</label>
                            <input
                                type="email"
                                id="contact_email"
                                name="contact_email"
                                value={formData.contact_email}
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

                <div className='customer-button-group'>
                    <button type="submit">新增委托方</button>
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
export default CustomerPage;
