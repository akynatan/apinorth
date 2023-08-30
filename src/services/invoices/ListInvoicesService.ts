import AppError from '@shared/errors/AppError';

import ClientsRepository from '@repositories/ClientsRepository';
import IClientsRepository from '@irepositories/IClientsRepository';

import ErrorsRepository from '@repositories/ErrorsRepository';
import IErrorsRepository from '@irepositories/IErrorsRepository';

import SankhyaRequest from '@services/sankhya/SankhyaRequest';

import IInvoiceSankhya from '@dtos/IInvoiceSankhya';

import { order } from '@helpers/index';

export default class ListInvoicesService {
  constructor(
    private errorsRepository: IErrorsRepository = new ErrorsRepository(),

    private clientsRepository: IClientsRepository = new ClientsRepository(),

    private sankhyaRequest = new SankhyaRequest(),
  ) {}

  public async execute(client_id: string): Promise<IInvoiceSankhya[]> {
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
                $: `this.CODPARC = ${client.external_id} AND STATUSNOTA = 'L'`,
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

    if (!response.status !== 200) {
      this.errorsRepository.create({
        type: 'GET CabecalhoNota',
        exception: JSON.stringify(response.data),
      });

      throw new AppError('Erro ao buscar dados de clientes.');
    }

    if (!response.data.responseBody) {
      return [];
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
  }
}
