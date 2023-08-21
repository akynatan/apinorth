import { Router } from 'express';

import FirstAccessServiceClient from '@services/clients/FirstAccessServiceClient';
import SetPasswordService from '@services/clients/SetPasswordService';

const clientsRouter = Router();

clientsRouter.post('/firstaccess', async (request, response) => {
  const {
    document,
    date_nasc
  } = request.body;

  const firstAccessServiceClient = new FirstAccessServiceClient();

  const responseClient = await firstAccessServiceClient.execute({
    document,
    date_nasc
  });

  delete responseClient.client.password;

  return response.json(responseClient);
});

clientsRouter.patch('/password', async (request, response) => {
  const { token, password } = request.body;

  const setPasswordService = new SetPasswordService();

  await setPasswordService.execute({
    token, password
  });

  return response.status(204).json();
});

export default clientsRouter;
