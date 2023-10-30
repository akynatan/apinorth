import fs from 'fs';

import AppError from '@shared/errors/AppError';
import NorthSankhyaCloudRequest from '@services/sankhya/NorthSankhyaCloudRequest';
import ErrorsRepository from '@repositories/ErrorsRepository';
import { AxiosError } from 'axios';

export default class DownloadInvoiceService {
  constructor(
    private errorsRepository = new ErrorsRepository(),

    private northSankhyaCloudRequest = new NorthSankhyaCloudRequest(),
  ) {}

  public async execute(
    invoice_id: string | undefined,
    client_id: string,
    model_invoice: string,
  ): Promise<any> {
    try {
      if (!invoice_id) {
        throw new AppError('Nota Fiscal inválida.');
      }

      const modelsInvoice = {
        '1101': 148, //21
        '1100': 148,
        '1118': 130, //debito
      };

      const codReport = modelsInvoice[model_invoice];

      await this.northSankhyaCloudRequest.init();
      await this.northSankhyaCloudRequest.initMgeSession();

      const data = {
        method: 'get',
        url: 'service.sbr?serviceName=VisualizadorRelatorios.visualizarRelatorio&outputType=json',
        data: {
          serviceName: 'VisualizadorRelatorios.visualizarRelatorio',
          requestBody: {
            relatorio: {
              nuRfe: codReport,
              parametros: {
                parametro: {
                  nome: 'NUNOTA',
                  descricao: 'NUNOTA',
                  classe: 'java.math.BigDecimal',
                  instancia: '',
                  valor: invoice_id,
                  pesquisa: 'false',
                  requerido: 'false',
                },
              },
            },
            clientEventList: {},
          },
        },
      };

      const response = await this.northSankhyaCloudRequest.execute(data);

      if (!response.data.responseBody) {
        this.errorsRepository.create({
          type: 'GET VisualizadorRelatorios.visualizarRelatorio NF',
          name: 'DownloadInvoiceService',
          instance_id: client_id,
          exception: JSON.stringify({
            responseData: response?.data,
            invoiceID: invoice_id,
          }),
        });

        throw new AppError('Nota fiscal não encontrado.');
      }

      const fileKey = response.data.responseBody?.chave?.valor;

      if (!fileKey) {
        throw new AppError('Falha no download da NF.');
      }

      const responseFile =
        await this.northSankhyaCloudRequest.executeDownloadFile(fileKey);

      return responseFile.data;
    } catch (err: any) {
      if (err instanceof AxiosError) {
        this.errorsRepository.create({
          type: 'AxiosError',
          name: 'DownloadInvoiceService',
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
          name: 'DownloadInvoiceService',
          instance_id: client_id,
          exception: JSON.stringify({
            error: err,
            errorMessage: err.message,
            errorName: err.name,
          }),
        });
      } else {
        this.errorsRepository.create({
          name: 'DownloadInvoiceService',
          type: 'GenericError',
          instance_id: client_id,
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

      throw new AppError('Erro ao fazer download da nota fiscal.');
    }
  }
}
