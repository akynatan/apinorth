import axios, { AxiosError } from 'axios';
import path from 'path';

import ClientsRepository from '@repositories/ClientsRepository';
import ClientTokensRepository from '@repositories/ClientTokensRepository';
import ErrorsRepository from '@repositories/ErrorsRepository';
import AppError from '@shared/errors/AppError';

import HandlebarsMailTemplateProvider from '@shared/container/providers/HandlebarsMailTemplateProvider/implementations/HandlebarsMailTemplateProvider';

interface IRequest {
  document: string;
}

export default class SendForgotPasswordEmailService {
  constructor(
    private clientsRepository = new ClientsRepository(),
    private clientTokensRepository = new ClientTokensRepository(),
    private errorsRepository = new ErrorsRepository(),
  ) {}

  public async execute({ document }: IRequest): Promise<void> {
    try {
      const client = await this.clientsRepository.findByDocument(document);

      if (!client) {
        throw new AppError('Documento inválido.');
      }

      const { token } = await this.clientTokensRepository.generate(client.id);

      const forgotPasswordTemplate = path.resolve(
        __dirname,
        '..',
        '..',
        'views',
        'forgot_password.hbs',
      );

      const contentBody = await new HandlebarsMailTemplateProvider().parse({
        file: forgotPasswordTemplate,
        variables: {
          name: client.name,
          link: `${process.env.APP_WEB_URL}/resetar-senha?token=${token}`,
        },
      });

      await axios.post(
        'https://api.smtplw.com.br/v1/messages',
        {
          subject: '[Portal North] - Recuperar senha',
          body: contentBody,
          from: 'no-reply@northtelecom.com.br',
          to:
            process.env.ENVIROMENT === 'prod'
              ? client.email
              : 'desenvolvimento@northtelecom.com.br',
          headers: {
            'Content-Type': 'text/plain',
          },
        },
        {
          headers: {
            'Content-Type': ' application/json',
            'x-auth-token': process.env.TOKEN_LOCAL_WEB,
          },
        },
      );
    } catch (err: any) {
      if (err instanceof AxiosError) {
        this.errorsRepository.create({
          type: 'AxiosError',
          name: 'SendForgotPasswordEmailService',
          instance_id: document,
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
          name: 'SendForgotPasswordEmailService',
          instance_id: document,
          exception: JSON.stringify({
            error: err,
            errorMessage: err.message,
            errorName: err.name,
          }),
        });
      } else {
        this.errorsRepository.create({
          name: 'SendForgotPasswordEmailService',
          instance_id: document,
          type: 'GenericError',
          exception: JSON.stringify({
            error: err,
            errorMessage: err.message,
            errorName: err.name,
          }),
        });
      }

      console.log(err);

      throw new AppError('Erro ao enviar email de recuperação de senha.');
    }
  }
}
