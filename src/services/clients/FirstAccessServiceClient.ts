import Client from '@entities/Client';

import AppError from '@shared/errors/AppError';

import IClientSankhya from 'dtos/IClientSankhya'

import ClientsRepository from '@repositories/ClientsRepository';
import IClientsRepository from '@irepositories/IClientsRepository';

import ClientTokensRepository from '@repositories/ClientTokensRepository';
import IClientTokensRepository from '@irepositories/IClientTokensRepository';

import SankhyaRequest from '@services/sankhya/SankhyaRequest'

interface IRequest {
  document: string;
  date_nasc: string;
}

interface IResponse {
  client: Client;
  token: string;
}

export default class FirstAccessServiceClient {
  constructor(
    private clientsRepository: IClientsRepository = new ClientsRepository(),

    private clientTokensRepository: IClientTokensRepository = new ClientTokensRepository(),

    private sankhyaRequest = new SankhyaRequest(),
  ) {}

  public async execute({
    document,
    date_nasc
  }: IRequest): Promise<IResponse> {
    if (!document || !date_nasc) {
      throw new AppError('Favor preencher o cpf/cnpj e data de nascimento/fundação.');
    }

    const documentClean = document.replace(/\D/g, '');

    let checkClientExists = await this.clientsRepository.findByDocument(
      documentClean
    );

    if (checkClientExists && checkClientExists.password) {
      throw new AppError('CPF/CNPJ já está cadastrado.');
    }
    
    await this.sankhyaRequest.init();
    const response = await this.sankhyaRequest.execute({
      method: 'get',
      url: 'service.sbr?serviceName=CRUDServiceProvider.loadRecords&outputType=json',
      data: {
        serviceName: "CRUDServiceProvider.loadRecords",
        requestBody: {
          dataSet: {
            rootEntity: "Parceiro",
            includePresentationFields: "N",
            offsetPage: "0",
            criteria: {
              expression: {
                $: `this.CGC_CPF = ${document} AND DTNASC = '${date_nasc}'`
              }
            },
            entity: {
              fieldset: {
                list: "CODPARC,CGC_CPF,NOMEPARC,RAZAOSOCIAL,TIPPESSOA,DTNASC"
              }
            }
          }
        }
      }
    })

    if (!response.data.responseBody) {
      throw new AppError('Cliente não encontrado.');
    }

    const responseClient = response.data.responseBody.entities;
    const totalClients = Number(responseClient.total);

    if (totalClients === 0) {
      throw new AppError('Cliente não encontrado.');
    }

    if (totalClients > 1) {
      throw new AppError('CPF duplicado na base de dados. Favor contatar o suporte');
    }

    const valuesClients = Object.entries(responseClient.entity).map(b => b[1]).map((c: any) => c.$);
    const fields = responseClient.metadata.fields.field;

    let client: IClientSankhya = {} as IClientSankhya;

    await Promise.all(fields.map((field: any, index: number) => {
      client[field.name as keyof IClientSankhya] = valuesClients[index];
      return field;
    }));

    if (!checkClientExists) {
      checkClientExists = await this.clientsRepository.create({
        external_id: client.CODPARC,
        document: client.CGC_CPF,
        name: client.NOMEPARC,
        corporate_name: client.RAZAOSOCIAL,
        kind_of_person: client.TIPPESSOA,
        date_nasc: client.DTNASC,
      });
    }

    const { token } = await this.clientTokensRepository.generate(checkClientExists.id);

    return { client: checkClientExists, token: token };
  }
}
