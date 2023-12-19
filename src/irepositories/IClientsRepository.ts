import ICreateClientDTO from '@dtos/ICreateClientDTO';
import Client from '@entities/Client';

export default interface IClientsRepository {
  findByID(id: string): Promise<Client | undefined>;
  findByDocument(document: string): Promise<Client | undefined>;
  create(data: ICreateClientDTO): Promise<Client>;
  list(): Promise<Client[]>;
  save(client: Client): Promise<Client>;
  find(client: any): Promise<Client[]>;
  findByEmail(email: string): Promise<Client | undefined>;
}
