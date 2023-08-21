import axios, { AxiosRequestConfig } from 'axios';

class SankhyaRequest {
  private token: string
  private baseURl: string = 'https://api.sankhya.com.br/gateway/v1/mge'

  public async init() {
    const responseToken = await axios.post('https://api.sankhya.com.br/login', {}, {
      headers: {
        token: process.env.SANKHYA_TOKEN,
        appKey: process.env.SANKHYA_APP_KEY,
        username: process.env.SANKHYA_USERNAME,
        password: process.env.SANKHYA_PASSWORD,
      }
    })

    if (responseToken.status !== 200) {
      throw 'Falha na comunicação com servidor';
    }

    this.token = responseToken.data.bearerToken;
  }

  public async execute(config: AxiosRequestConfig) {
    return axios({
      ...config,
      url: `${this.baseURl}/${config.url}`,
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    })
  }
}

export default SankhyaRequest;
