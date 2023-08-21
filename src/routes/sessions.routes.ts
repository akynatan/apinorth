import { Router } from 'express';

import AuthenticationClientService from '@services/clients/AuthenticationClientService';

const authenticationRouter = Router();

authenticationRouter.post('/', async (request, response) => {
  const { document, password } = request.body;

  const authenticationClient = new AuthenticationClientService();

  const { client, token } = await authenticationClient.execute({
    document,
    password,
  });

  return response.json({ client, token });
});

export default authenticationRouter;
