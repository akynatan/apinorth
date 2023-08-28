import axios, { AxiosRequestConfig } from 'axios';
import { application } from 'express';

class NorthSankhyaCloudRequest {
  private token: string
  private jsessionid: string
  private cookie: string | undefined

  private baseURl: string = 'https://north.sankhyacloud.com.br/mge'

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

  public async initMgeSession() {
    const responseToken = await axios.post('https://north.sankhyacloud.com.br/mge/service.sbr?serviceName=MobileLoginSP.login&outputType=json', {
      serviceName: "MobileLoginSP.login",
      requestBody: {
        "NOMUSU": {
          "$": process.env.SANKHYA_USERNAME
        },
        "INTERNO": {
          "$": process.env.SANKHYA_PASSWORD
        },
        "KEEPCONNECTED": {
          "$": "S"
        }
      }
    })

    if (responseToken.status !== 200 || !responseToken.data?.responseBody) {
      throw 'Falha na comunicação com servidor';
    }

    console.log("response.headers['set-cookie'];", responseToken.headers['set-cookie'])

    this.jsessionid = responseToken.data.responseBody.jsessionid.$;
    this.cookie = responseToken.headers['set-cookie']?.length ? responseToken.headers['set-cookie'][0] : undefined;
  }

  public async execute(config: AxiosRequestConfig) {
    return axios({
      ...config,
      url: `${this.baseURl}/${config.url}`,
      headers: {
        "Content-Type": 'application/json',
        Cookie: this.cookie
      }
    })
  }

  public async executeDownloadFile(fileKey: string) {
    return axios({
      url: `${this.baseURl}/visualizadorArquivos.mge`,
      method: 'get',
      headers: {
        Cookie: this.cookie
      },
      params: {
        mgeSession: this.jsessionid,
        chaveArquivo: fileKey,
        download: 'S'
      },
      responseType: 'arraybuffer'
    })
  }
}

export default NorthSankhyaCloudRequest;
