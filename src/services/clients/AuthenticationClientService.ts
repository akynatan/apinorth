import { sign } from 'jsonwebtoken';

import ClientsRepository from '@repositories/ClientsRepository';
import IClientsRepository from '@irepositories/IClientsRepository';

import BCryptHashProvider from '@shared/container/providers/HashProvider/implementations/BCryptHashProvider';
import IHashProvider from '@shared/container/providers/HashProvider/models/IHashProvider';

import authConfig from '@config/auth';
import AppError from '@shared/errors/AppError';
import Client from '@entities/Client';

interface IRequest {
  document: string;
  password: string;
}

interface IResponse {
  client: Client;
  token: string;
}

export default class AuthenticationClientService {
  constructor(
    private clientsRepository: IClientsRepository = new ClientsRepository(),
            
    private hashProvider: IHashProvider = new BCryptHashProvider(),
  ) {}

  public async execute({ document, password }: IRequest): Promise<IResponse> {
    const client = await this.clientsRepository.findByDocument(document);

    if (!client) {
      throw new AppError('Documento ou senha incorreto.', 401);
    }

    const passwordMatched = await this.hashProvider.compareHash(
      password,
      client.password,
    );

    if (!passwordMatched) {
      throw new AppError('Documento ou senha incorreto.', 401);
    }

    const { secret, expiresIn } = authConfig.jwt;
    const token = sign({}, secret, {
      subject: client.id,
      expiresIn,
    });

    return { client, token };
  }
}
