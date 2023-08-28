import fs from 'fs';

import AppError from '@shared/errors/AppError';
import NorthSankhyaCloudRequest from '@services/sankhya/NorthSankhyaCloudRequest'

interface IRequest {
  numSlip: string;
  idSlip: string;
  codBank: "756" | "341";
}

export default class DownloadslipService {
  private northSankhyaCloudRequest: NorthSankhyaCloudRequest

  constructor() {
    this.northSankhyaCloudRequest = new NorthSankhyaCloudRequest()
  }

  public async execute({
    numSlip,
    idSlip,
    codBank
  }: IRequest): Promise<any> {
    await this.northSankhyaCloudRequest.init();
    await this.northSankhyaCloudRequest.initMgeSession();

    const reports = {
      "756": 16,
      "341": 11
    };

    const codReport = reports[codBank];

    const data = {
      method: 'get',
      url: 'service.sbr?serviceName=BoletoSP.buildPreVisualizacao&outputType=json',
      data: {
        serviceName: "BoletoSP.buildPreVisualizacao",
        requestBody: {
          configBoleto: {
            agrupamentoBoleto: "4",
            ordenacaoParceiro: 1,
            dupRenegociadas: false,
            gerarNumeroBoleto: false,
            codigoConta: "",
            codBco: "",
            codEmp: "",
            nossoNumComecando: "",
            alterarTipoTitulo: false,
            tipoTitulo: -1,
            bcoIgualConta: false,
            empIgualConta: false,
            reimprimir: true,
            tipoReimpressao: "S",
            registraConta: false,
            codigoRelatorio: codReport,
            codCtaBcoInt: "",
            boletoRapido: false,
            telaImpressaoBoleto: true,
            boleto: {
              binicial: numSlip,
              bfinal: numSlip
            },
            titulo: [
              {
                "$": idSlip
              }
            ]
          }
        }
      }
    }

    const response = await this.northSankhyaCloudRequest.execute(data)

    if (!response.data.responseBody) {
      throw new AppError('Boleto não encontrado.');
    }

    const fileKey = response.data.responseBody?.boleto?.valor;

    if (!fileKey) {
      throw new AppError('Falha no download do boleto.');
    }

    const responseFile = await this.northSankhyaCloudRequest.executeDownloadFile(fileKey);

    return responseFile.data;
  }
}
