import { Router } from 'express';
import SendForgotPasswordEmailService from '@services/clients/SendForgotPasswordEmailService';
import ResetPasswordService from '@services/clients/ResetPasswordService';

const passwordRouter = Router();

passwordRouter.post('/forgot', async (request, response) => {
  const { document } = request.body;

  const sendForgotPasswordEmail = new SendForgotPasswordEmailService();

  await sendForgotPasswordEmail.execute({ document });

  return response.status(204).json();
});

passwordRouter.post('/reset', async (request, response) => {
  const { token, password } = request.body;

  const sendForgotPasswordEmail = new ResetPasswordService();

  await sendForgotPasswordEmail.execute({ token, password });

  return response.status(204).json();
});

export default passwordRouter;
