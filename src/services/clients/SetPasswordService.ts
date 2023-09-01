import { isAfter, addHours } from 'date-fns';

import AppError from '@shared/errors/AppError';

import ClientsRepository from '@repositories/ClientsRepository';

import ClientTokensRepository from '@repositories/ClientTokensRepository';

import BCryptHashProvider from '@shared/container/providers/HashProvider/implementations/BCryptHashProvider';

interface IRequest {
  token: string;
  password: string;
}

export default class SetPasswordService {
  constructor(
    private clientsRepository = new ClientsRepository(),

    private clientTokensRepository = new ClientTokensRepository(),

    private hashProvider = new BCryptHashProvider(),
  ) {}

  public async execute({ password, token }: IRequest): Promise<void> {
    if (password.length < 6) {
      throw new AppError('Digite no minimo 6 caracteres.', 400);
    }

    const clientToken = await this.clientTokensRepository.findByToken(token);

    if (!clientToken) {
      throw new AppError('Token de senha não existe');
    }

    const client = await this.clientsRepository.findByID(clientToken.client_id);

    if (!client) {
      throw new AppError('Cliente não encontrado');
    }

    const tokenCreatedAt = clientToken.created_at;
    const compareDate = addHours(tokenCreatedAt, 2);

    if (isAfter(Date.now(), compareDate)) {
      throw new AppError(
        'Token expirado. Faça o cadastro novamente em Primeiro Acesso',
      );
    }
    client.password = await this.hashProvider.generateHash(password);

    await this.clientTokensRepository.delete(clientToken.id);
    await this.clientsRepository.save(client);
  }
}
