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

export const createPayment = (paymentData) => {
  return axios.post(`${baseURL}/payments/create`, paymentData);
};

export const getCustomers = (searchNameTerm, searchContactNameTerm, searchContactPhoneTerm) => {
  return axios.get(`${baseURL}/customers/`, {
    params: {
      searchNameTerm, searchContactNameTerm, searchContactPhoneTerm
    }
  });
};

export const getPayers = (searchNameTerm, searchContactNameTerm, searchContactPhoneTerm) => {
  return axios.get(`${baseURL}/payments/`, {
    params: {
      searchNameTerm, searchContactNameTerm, searchContactPhoneTerm
    }

  });
};

export const prefillPayment = (customerId) => {
  return axios.get(`${baseURL}/payments/prefill?customerId=${customerId}`);
};

export const validatePhone = (phoneNumber, customerName) => {
  return axios.post(`${baseURL}/customers/check-phone`, { contactPhoneNum: phoneNumber , customerName: customerName});
};
    
export const validatePayerPhone = (phoneNumber, payerName) => {
  return axios.post(`${baseURL}/payments/check-phone`, { payerContactPhoneNum: phoneNumber, payerName: payerName });
};
   