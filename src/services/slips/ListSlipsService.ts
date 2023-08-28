import SankhyaRequest from '@services/sankhya/SankhyaRequest'

import ISlipSankhya from '@dtos/ISlipSankhya';

import { order } from '@helpers/index'

export default class ListSlipsService {
  constructor(
    private sankhyaRequest = new SankhyaRequest(),
  ) { }

  public async execute(invoice_id: string | undefined): Promise<ISlipSankhya[]> {
    await this.sankhyaRequest.init();
    const response = await this.sankhyaRequest.execute({
      method: 'get',
      url: 'service.sbr?serviceName=CRUDServiceProvider.loadRecords&outputType=json',
      data: {
        serviceName: "CRUDServiceProvider.loadRecords",
        requestBody: {
          dataSet: {
            rootEntity: "Financeiro",
            includePresentationFields: "S",
            offsetPage: "0",
            criteria: {
              expression: {
                "$": `NUMNOTA = ${invoice_id} AND RECDESP = 1`
              }
            },
            entity: {
              fieldset: {
                list: "NUFIN,DTNEG,DTVENC,CODBARRA,VLRDESDOB,NOSSONUM,CODBCO"
              }
            }
          }
        }
      }
    })

    if (!response.data.responseBody) {
      return []
    }

    const responseSlips = response.data.responseBody.entities;
    const fields = responseSlips.metadata.fields.field;
    const totalSlips = Number(responseSlips.total);

    if (totalSlips === 0) {
      return []
    }

    let slipsToMap = null;

    if (totalSlips === 1) {
      slipsToMap = [responseSlips.entity]
    } else {
      slipsToMap = responseSlips.entity
    }

    const slips = await Promise.all(slipsToMap.map(async (slipCurrent: any) => {
      const valuesSlips = Object.entries(slipCurrent).sort(order).map(b => b[1]).map((c: any) => c.$);

      let slip: ISlipSankhya = {} as ISlipSankhya;

      await Promise.all(fields.map((field: any, index: number) => {
        slip[field.name as keyof ISlipSankhya] = valuesSlips[index];
        return field;
      }));

      return slip;
    }));

    return slips
  }
}
