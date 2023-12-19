import { Router } from 'express';

import UpdateProfileService from '@services/clients/UpdateProfileService';
import isAuthenticated from '@middlewares/isAuthenticated';

const profilesRouter = Router();
profilesRouter.use(isAuthenticated);

profilesRouter.put('/:id', async (request, response) => {
  const { password, old_password, name, email } = request.body;
  const client_id = request.params.id;

  const updateProfileService = new UpdateProfileService();

  const responseClient = await updateProfileService.execute({
    client_id,
    password,
    old_password,
    name,
    email,
  });

  return response.json(responseClient);
});

export default profilesRouter;
