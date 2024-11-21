import axios from 'axios';

const baseURL = 'http://localhost:3001';

export const createCommission = (commissionData) => {
  return axios.post(`${baseURL}/commission`, commissionData);
};

export const getPaymentInfoByCustomerName = (customerName) => {
  return axios.get(`${baseURL}/payments`, {
    params: { customerName }
  });
};


export const getSalesperson = () => {
  return axios.get(`${baseURL}/salespersons`, {});
};


export const createCustomer = (customerData) => {
  return axios.post(`${baseURL}/customers/create`, customerData);
};

export const getCustomers = () => {
  return axios.get(`${baseURL}/customers/`, {});
};

export const getPayers = () => {
  return axios.get(`${baseURL}/payments/`, {});
};