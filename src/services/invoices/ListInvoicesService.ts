import { AxiosError } from 'axios';

import AppError from '@shared/errors/AppError';

import ClientsRepository from '@repositories/ClientsRepository';

import ErrorsRepository from '@repositories/ErrorsRepository';

import SankhyaRequest from '@services/sankhya/SankhyaRequest';

import IInvoiceSankhya from '@dtos/IInvoiceSankhya';

import { order } from '@helpers/index';

export default class ListInvoicesService {
  constructor(
    private errorsRepository = new ErrorsRepository(),

    private clientsRepository = new ClientsRepository(),

    private sankhyaRequest = new SankhyaRequest(),
  ) {}

  public async execute(client_id: string): Promise<IInvoiceSankhya[]> {
    try {
      const client = await this.clientsRepository.findByID(client_id);

      if (!client) {
        throw new AppError('Cliente não encontrado.');
      }

      await this.sankhyaRequest.init();
      const response = await this.sankhyaRequest.execute({
        method: 'get',
        url: 'service.sbr?serviceName=CRUDServiceProvider.loadRecords&outputType=json',
        data: {
          serviceName: 'CRUDServiceProvider.loadRecords',
          requestBody: {
            dataSet: {
              rootEntity: 'CabecalhoNota',
              includePresentationFields: 'S',
              offsetPage: '0',
              criteria: {
                expression: {
                  $: `this.CODPARC = ${client.external_id} AND STATUSNOTA = 'L'  AND (this.CODEMP = 5 OR this.CODEMP = 100 OR this.CODEMP = 11)`,
                },
              },
              entity: {
                fieldset: {
                  list: 'NUNOTA,NUMNOTA,DTNEG,VLRNOTA',
                },
              },
            },
          },
        },
      });

      if (!response.data.responseBody) {
        this.errorsRepository.create({
          type: 'GET CabecalhoNota',
          name: 'ListInvoicesService',
          instance_id: client_id,
          exception: JSON.stringify({
            responseData: response?.data,
          }),
        });

        throw new AppError('Erro ao buscar notas fiscais.');
      }

      const responseInvoices = response.data.responseBody.entities;
      const fields = responseInvoices.metadata.fields.field;
      const totalInvoices = Number(responseInvoices.total);

      if (totalInvoices === 0) {
        return [];
      }

      let invoicesToMap = null;

      if (totalInvoices === 1) {
        invoicesToMap = [responseInvoices.entity];
      } else {
        invoicesToMap = responseInvoices.entity;
      }

      const invoices = await Promise.all(
        invoicesToMap.map(async (invoiceCurrent: any) => {
          const valuesInvoices = Object.entries(invoiceCurrent)
            .sort(order)
            .map(b => b[1])
            .map((c: any) => c.$);

          let invoice: IInvoiceSankhya = {} as IInvoiceSankhya;

          await Promise.all(
            fields.map((field: any, index: number) => {
              invoice[field.name as keyof IInvoiceSankhya] =
                valuesInvoices[index];
              return field;
            }),
          );

          return invoice;
        }),
      );

      return invoices;
    } catch (err: any) {
      if (err instanceof AxiosError) {
        this.errorsRepository.create({
          type: 'AxiosError',
          name: 'ListInvoicesService',
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
          name: 'ListInvoicesService',
          instance_id: client_id,
          exception: JSON.stringify({
            error: err,
            errorMessage: err.message,
            errorName: err.name,
          }),
        });
      } else {
        this.errorsRepository.create({
          name: 'ListInvoicesService',
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

      throw new AppError('Erro ao buscar notas fiscais.');
    }
  }
}
