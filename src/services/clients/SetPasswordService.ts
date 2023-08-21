import { isAfter, addHours } from 'date-fns';

import AppError from '@shared/errors/AppError';

import ClientsRepository from '@repositories/ClientsRepository';
import IClientsRepository from '@irepositories/IClientsRepository';

import ClientTokensRepository from '@repositories/ClientTokensRepository';
import IClientTokensRepository from '@irepositories/IClientTokensRepository';

import IHashProvider from '@shared/container/providers/HashProvider/models/IHashProvider';
import BCryptHashProvider from '@shared/container/providers/HashProvider/implementations/BCryptHashProvider';

interface IRequest {
  token: string;
  password: string;
}

export default class SetPasswordService {
  constructor(
    private clientsRepository: IClientsRepository = new ClientsRepository(),

    private clientTokensRepository: IClientTokensRepository = new ClientTokensRepository(),

    private hashProvider: IHashProvider = new BCryptHashProvider(),
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
      throw new AppError('Token expirado. Faça o cadastro novamente em Primeiro Acesso');
    }
    client.password = await this.hashProvider.generateHash(password);
    
    await this.clientTokensRepository.delete(clientToken.id)
    await this.clientsRepository.save(client);
  }
}