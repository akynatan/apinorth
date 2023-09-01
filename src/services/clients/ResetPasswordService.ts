import { AxiosError } from 'axios';
import { addHours, isAfter } from 'date-fns';

import ClientsRepository from '@repositories/ClientsRepository';
import ClientTokensRepository from '@repositories/ClientTokensRepository';
import ErrorsRepository from '@repositories/ErrorsRepository';
import AppError from '@shared/errors/AppError';

import BCryptHashProvider from '@shared/container/providers/HashProvider/implementations/BCryptHashProvider';

interface IRequest {
  token: string;
  password: string;
}

export default class ResetPasswordService {
  constructor(
    private clientsRepository = new ClientsRepository(),
    private clientTokensRepository = new ClientTokensRepository(),
    private errorsRepository = new ErrorsRepository(),
    private hashProvider = new BCryptHashProvider(),
  ) {}

  public async execute({ password, token }: IRequest): Promise<void> {
    try {
      if (password.length < 6) {
        throw new AppError('Digite no minimo 6 caracteres.', 400);
      }

      const clientToken = await this.clientTokensRepository.findByToken(token);

      if (!clientToken) {
        throw new AppError('Token de senha não existe');
      }

      const client = await this.clientsRepository.findByID(
        clientToken.client_id,
      );

      if (!client) {
        throw new AppError('Cliente não encontrado');
      }

      const tokenCreatedAt = clientToken.created_at;
      const compareDate = addHours(tokenCreatedAt, 2);

      if (isAfter(Date.now(), compareDate)) {
        throw new AppError('Token expirado. Solicite um novo token.');
      }

      client.password = await this.hashProvider.generateHash(password);

      await this.clientTokensRepository.delete(clientToken.id);
      await this.clientsRepository.save(client);
    } catch (err: any) {
      if (err instanceof AxiosError) {
        this.errorsRepository.create({
          type: 'AxiosError',
          name: 'ResetPasswordService',
          instance_id: token,
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
          name: 'ResetPasswordService',
          instance_id: token,
          exception: JSON.stringify({
            error: err,
            errorMessage: err.message,
            errorName: err.name,
          }),
        });
      } else {
        this.errorsRepository.create({
          name: 'ResetPasswordService',
          instance_id: token,
          type: 'GenericError',
          exception: JSON.stringify({
            error: err,
            errorMessage: err.message,
            errorName: err.name,
          }),
        });
      }

      throw new AppError('Erro ao enviar email de recuperação de senha.');
    }
  }
}
