import { Repository, getRepository } from 'typeorm';
import ICreateClientDTO from '@dtos/ICreateClientDTO';
import IClientsRepository from '@irepositories/IClientsRepository';

import Client from '@entities/Client';

export default class ClientsRepository implements IClientsRepository {
  private ormRepository: Repository<Client>;

  constructor() {
    this.ormRepository = getRepository(Client);
  }

  public async findByID(id: string): Promise<Client | undefined> {
    const client = await this.ormRepository.findOne(id);
    return client;
  }

  public async findByDocument(document: string): Promise<Client | undefined> {
    const client = await this.ormRepository.findOne({
      where: { document },
    });

    return client;
  }

  public async save(client: Client): Promise<Client> {
    await this.ormRepository.save(client);
    return client;
  }

  public async create(clientData: ICreateClientDTO): Promise<Client> {
    const client = this.ormRepository.create(clientData);
    await this.ormRepository.save(client);
    return client;
  }

  public async list(): Promise<Client[]> {
    const client = this.ormRepository.find({
      relations: ['city', 'manager', 'supervisors', 'supervisors.supervisor'],
    });
    return client;
  }

  public async find(client: any): Promise<Client[]> {
    const clients = await this.ormRepository.find({
      where: { ...client },
      relations: ['city', 'manager', 'supervisors', 'supervisors.supervisor'],
    });

    return clients;
  }

  public async findByEmail(email: string): Promise<Client | undefined> {
    const user = await this.ormRepository.findOne({
      where: { email },
    });

    return user;
  }
}
