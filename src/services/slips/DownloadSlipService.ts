import fs from 'fs';

import AppError from '@shared/errors/AppError';
import NorthSankhyaCloudRequest from '@services/sankhya/NorthSankhyaCloudRequest';

import ErrorsRepository from '@repositories/ErrorsRepository';
import { AxiosError } from 'axios';

interface IRequest {
  numSlip: string;
  idSlip: string;
  codBank: '756' | '341';
  client_id: string;
}

export default class DownloadslipService {
  constructor(
    private errorsRepository = new ErrorsRepository(),

    private northSankhyaCloudRequest = new NorthSankhyaCloudRequest(),
  ) {}

  public async execute({
    numSlip,
    idSlip,
    codBank,
    client_id,
  }: IRequest): Promise<any> {
    try {
      await this.northSankhyaCloudRequest.init();
      await this.northSankhyaCloudRequest.initMgeSession();

      const reports = {
        '756': 16,
        '341': 11,
      };

      const codReport = reports[codBank];

      const data = {
        method: 'get',
        url: 'service.sbr?serviceName=BoletoSP.buildPreVisualizacao&outputType=json',
        data: {
          serviceName: 'BoletoSP.buildPreVisualizacao',
          requestBody: {
            configBoleto: {
              agrupamentoBoleto: '4',
              ordenacaoParceiro: 1,
              dupRenegociadas: false,
              gerarNumeroBoleto: false,
              codigoConta: '',
              codBco: '',
              codEmp: '',
              nossoNumComecando: '',
              alterarTipoTitulo: false,
              tipoTitulo: -1,
              bcoIgualConta: false,
              empIgualConta: false,
              reimprimir: true,
              tipoReimpressao: 'S',
              registraConta: false,
              codigoRelatorio: codReport,
              codCtaBcoInt: '',
              boletoRapido: false,
              telaImpressaoBoleto: true,
              boleto: {
                binicial: numSlip,
                bfinal: numSlip,
              },
              titulo: [
                {
                  $: idSlip,
                },
              ],
            },
          },
        },
      };

      const response = await this.northSankhyaCloudRequest.execute(data);

      if (!response.data.responseBody) {
        this.errorsRepository.create({
          type: 'GET BoletoSP.buildPreVisualizacao',
          name: 'DownloadslipService',
          instance_id: client_id,
          exception: JSON.stringify({
            responseData: response?.data,
            numSlip,
            idSlip,
            codBank,
          }),
        });

        throw new AppError('Boleto não encontrado.');
      }

      const fileKey = response.data.responseBody?.boleto?.valor;

      if (!fileKey) {
        throw new AppError('Falha no download do boleto.');
      }

      const responseFile =
        await this.northSankhyaCloudRequest.executeDownloadFile(fileKey);

      return responseFile.data;
    } catch (err: any) {
      if (err instanceof AxiosError) {
        this.errorsRepository.create({
          type: 'AxiosError',
          name: 'DownloadslipService',
          instance_id: client_id,
          exception: JSON.stringify({
            responseData: err?.response?.data,
            responseStatus: err?.response?.status,
            requestUrl: err?.config?.url,
            requestData: err?.config?.data,
          }),
        });
      } else if (err.name === 'QueryFailedError') {
        this.errorsRepository.create({
          type: 'QueryFailedError',
          name: 'DownloadslipService',
          instance_id: client_id,
          exception: JSON.stringify({
            error: err,
            errorMessage: err.message,
            errorName: err.name,
          }),
        });
      } else {
        this.errorsRepository.create({
          name: 'DownloadslipService',
          instance_id: client_id,
          type: 'GenericError',
          exception: JSON.stringify({
            error: err,
            errorMessage: err.message,
            errorName: err.name,
          }),
        });
      }

      if (err?.response?.data?.error?.descricao) {
        throw new AppError(err?.response?.data?.error?.descricao);
      }

      if (err instanceof AppError) {
        throw new AppError(err.message);
      }

      throw new AppError('Erro ao fazer download de boleto.');
    }
  }
}
