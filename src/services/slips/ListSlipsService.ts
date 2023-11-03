import SankhyaRequest from '@services/sankhya/SankhyaRequest';

import ISlipSankhya from '@dtos/ISlipSankhya';

import { order } from '@helpers/index';

import ErrorsRepository from '@repositories/ErrorsRepository';

import { AxiosError } from 'axios';
import AppError from '@shared/errors/AppError';

export default class ListSlipsService {
  constructor(
    private errorsRepository = new ErrorsRepository(),

    private sankhyaRequest = new SankhyaRequest(),
  ) {}

  public async execute(
    invoice_id: string | undefined,
    client_id: string,
  ): Promise<ISlipSankhya[]> {
    try {
      await this.sankhyaRequest.init();
      const response = await this.sankhyaRequest.execute({
        method: 'get',
        url: 'service.sbr?serviceName=CRUDServiceProvider.loadRecords&outputType=json',
        data: {
          serviceName: 'CRUDServiceProvider.loadRecords',
          requestBody: {
            dataSet: {
              rootEntity: 'Financeiro',
              includePresentationFields: 'S',
              offsetPage: '0',
              criteria: {
                expression: {
                  $: `NUMNOTA = ${invoice_id} AND RECDESP = 1  AND this.CODEMP in (5,100, 11)`,
                },
              },
              entity: {
                fieldset: {
                  list: 'NUFIN,DTNEG,DTVENC,CODIGOBARRA,VLRDESDOB,NOSSONUM,CODBCO',
                },
              },
            },
          },
        },
      });

      if (!response.data.responseBody) {
        this.errorsRepository.create({
          type: 'GET CabecalhoNota',
          name: 'ListSlipsService',
          instance_id: client_id,
          exception: JSON.stringify({
            responseData: response?.data,
          }),
        });

        throw new AppError('Erro ao buscar boletos.');
      }

      const responseSlips = response.data.responseBody.entities;
      const fields = responseSlips.metadata.fields.field;
      const totalSlips = Number(responseSlips.total);

      if (totalSlips === 0) {
        return [];
      }

      let slipsToMap = null;

      if (totalSlips === 1) {
        slipsToMap = [responseSlips.entity];
      } else {
        slipsToMap = responseSlips.entity;
      }

      const slips = await Promise.all(
        slipsToMap.map(async (slipCurrent: any) => {
          const valuesSlips = Object.entries(slipCurrent)
            .sort(order)
            .map(b => b[1])
            .map((c: any) => c.$);

          let slip: ISlipSankhya = {} as ISlipSankhya;

          await Promise.all(
            fields.map((field: any, index: number) => {
              slip[field.name as keyof ISlipSankhya] = valuesSlips[index];
              return field;
            }),
          );

          return slip;
        }),
      );

      return slips;
    } catch (err: any) {
      if (err instanceof AxiosError) {
        this.errorsRepository.create({
          type: 'AxiosError',
          name: 'ListSlipsService',
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
          name: 'ListSlipsService',
          instance_id: client_id,
          exception: JSON.stringify({
            error: err,
            errorMessage: err.message,
            errorName: err.name,
          }),
        });
      } else {
        this.errorsRepository.create({
          name: 'ListSlipsService',
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

      throw new AppError('Erro ao buscar boletos.');
    }
  }
}
