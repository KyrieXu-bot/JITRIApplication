import axios from 'axios';

const baseURL = 'http://localhost:3001/commission';

export const createCommission = (commissionData) => {
  return axios.post(baseURL, commissionData);
};
