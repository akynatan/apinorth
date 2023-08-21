import { getRepository, Repository } from 'typeorm';

import IClientTokensRepository from '@irepositories/IClientTokensRepository';

import ClientToken from '@entities/ClientToken';

class ClientTokensRepository implements IClientTokensRepository {
  private ormRepository: Repository<ClientToken>;

  constructor() {
    this.ormRepository = getRepository(ClientToken);
  }

  public async findByToken(token: string): Promise<ClientToken | undefined> {
    const clientToken = await this.ormRepository.findOne({
      where: { token },
    });

    return clientToken;
  }

  public async generate(client_id: string): Promise<ClientToken> {
    const clientToken = this.ormRepository.create({
      client_id,
    });

    await this.ormRepository.save(clientToken);

    return clientToken;
  }

  public async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}

export default ClientTokensRepository;
