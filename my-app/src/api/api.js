import axios from 'axios';

const baseURL = 'http://localhost:3001';

export const createCommission = (commissionData) => {
  return axios.post(`${baseURL}/commission`, commissionData);
};

// 在api.js中添加新的函数调用新的API端点
export const getPaymentInfoByPhoneNumber = (phoneNumber) => {
  return axios.get(`${baseURL}/prefill-payment-info`, {
    params: { phoneNumber }
  });
};
