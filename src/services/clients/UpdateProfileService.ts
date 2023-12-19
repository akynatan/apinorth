import Client from '@entities/Client';

import AppError from '@shared/errors/AppError';

import ClientsRepository from '@repositories/ClientsRepository';

import BCryptHashProvider from '@shared/container/providers/HashProvider/implementations/BCryptHashProvider';

interface IRequest {
  client_id: string;
  password: string | undefined;
  old_password: string;
  email: string;
  name: string;
}

export default class SetPasswordService {
  constructor(
    private clientsRepository = new ClientsRepository(),

    private hashProvider = new BCryptHashProvider(),
  ) {}

  public async execute({
    client_id,
    password,
    old_password,
    name,
    email,
  }: IRequest): Promise<Client> {
    if (password && password.length < 6) {
      throw new AppError('Digite no minimo 6 caracteres.', 400);
    }

    const client = await this.clientsRepository.findByID(client_id);

    if (!client) {
      throw new AppError('Cliente não encontrado');
    }

    const checkClientExists = await this.clientsRepository.findByEmail(
      client_id,
    );

    if (checkClientExists && client?.email !== checkClientExists.email) {
      throw new AppError('Email já está em uso.');
    }

    if (password && old_password) {
      const passwordMatched = await this.hashProvider.compareHash(
        old_password,
        client.password,
      );

      if (!passwordMatched) {
        throw new AppError('Senha atual está incorreta.');
      }

      const hashedPassword = await this.hashProvider.generateHash(password);
      client.password = hashedPassword;
    }

    client.name = name;
    client.email = email;

    await this.clientsRepository.save(client);

    return client;
  }
}
