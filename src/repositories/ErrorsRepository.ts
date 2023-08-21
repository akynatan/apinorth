import { Repository, getRepository } from 'typeorm';
import ICreateErrorDTO from '@dtos/ICreateErrorDTO';
import IErrorsRepository from '@irepositories/IErrorsRepository';

import Error from '@entities/Error';

export default class ErrorsRepository implements IErrorsRepository {
  private ormRepository: Repository<Error>;

  constructor() {
    this.ormRepository = getRepository(Error);
  }

  public async create(data: ICreateErrorDTO): Promise<Error> {
    const error = this.ormRepository.create(data);
    await this.ormRepository.save(error);
    return error;
  }
}
