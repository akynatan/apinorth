import axios from 'axios';

const apiSankhya = axios.create({
  baseURL: 'https://api.sankhya.com.br/gateway/v1/mge',
});

export default apiSankhya;
