import fs from 'fs';

import AppError from '@shared/errors/AppError';
import NorthSankhyaCloudRequest from '@services/sankhya/NorthSankhyaCloudRequest'

export default class DownloadInvoiceService {
  private northSankhyaCloudRequest: NorthSankhyaCloudRequest

  constructor() {
    this.northSankhyaCloudRequest = new NorthSankhyaCloudRequest()
   }

  public async execute(invoice_id: string | undefined): Promise<any> {
    if (!invoice_id) {
      throw new AppError('Nota Fiscal inválida.');
    }

    await this.northSankhyaCloudRequest.init();
    await this.northSankhyaCloudRequest.initMgeSession();

    const data = {
      method: 'get',
      url: 'service.sbr?serviceName=VisualizadorRelatorios.visualizarRelatorio&outputType=json',
      data: {
        serviceName: "VisualizadorRelatorios.visualizarRelatorio",
        requestBody: {
          relatorio: {
            nuRfe: "132",
            parametros: {
              parametro: {
                nome: "NUNOTA",
                descricao: "NUNOTA",
                classe: "java.math.BigDecimal",
                instancia: "",
                valor: invoice_id,
                pesquisa: "false",
                requerido: "false"
              }
            }
          },
          clientEventList: {}
        }
      }
    }

    const response = await this.northSankhyaCloudRequest.execute(data)

    if (!response.data.responseBody) {
      throw new AppError('Nota Fiscal não encontrada.');
    }

    const fileKey = response.data.responseBody?.chave?.valor;

    if (!fileKey) {
      throw new AppError('Falha no download da NF.');
    }

    const responseFile = await this.northSankhyaCloudRequest.executeDownloadFile(fileKey);
    
    return responseFile.data;
  }
}
