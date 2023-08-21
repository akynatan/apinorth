import ClientToken from '@entities/ClientToken';

export default interface IClientTokensRepository {
  generate(client_id: string): Promise<ClientToken>;
  delete(id: string): Promise<void>;
  findByToken(token: string): Promise<ClientToken | undefined>;
}
