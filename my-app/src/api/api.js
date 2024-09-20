import axios from 'axios';

const baseURL = 'http://localhost:3001';

export const createCommission = (commissionData) => {
  return axios.post(`${baseURL}/commission`, commissionData);
};

export const getPaymentInfoByPhoneNumber = (phoneNumber) => {
  return axios.get(`${baseURL}/prefill-payment-info`, {
    params: { phoneNumber }
  });
};


export const getSalesperson = () => {
  return axios.get(`${baseURL}/salespersons`, {});
};
