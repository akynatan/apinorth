import Error from '@entities/Error';
import ICreateErrorDTO from '@dtos/ICreateErrorDTO';

export default interface IErrorsRepository {
  create(data: ICreateErrorDTO): Promise<Error>;
}
