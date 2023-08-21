import axios from 'axios';

class SankhyaBearerToken {
  public async execute() {
    axios({
      method: ''
    })

    const response = await axios.post('https://api.sankhya.com.br/login', {}, {
      headers: {
        token: process.env.SANKHYA_TOKEN,
        appKey: process.env.SANKHYA_APP_KEY,
        username: process.env.SANKHYA_USERNAME,
        password: process.env.SANKHYA_PASSWORD,
      }
    })

    if (response.status === 200) {
      return response.data.bearerToken
    }

    return null
  }
}

export default SankhyaBearerToken;
