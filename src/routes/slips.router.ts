import { Router } from 'express';

import isAuthenticated from '@middlewares/isAuthenticated';

import ListSlipsService from '@services/slips/ListSlipsService';
import DownloadSlipService from '@services/slips/DownloadSlipService';

const slipsRouter = Router();

slipsRouter.use(isAuthenticated);

slipsRouter.get('/', async (request, response) => {
  const listSlipsService = new ListSlipsService();

  const invoice_id = request.query.invoice_id
    ? String(request.query.invoice_id)
    : undefined;

  const client_id = request.user.id;

  const slips = await listSlipsService.execute(invoice_id, client_id);

  return response.json(slips);
});

slipsRouter.post('/:id/download', async (request, response) => {
  const downloadSlipService = new DownloadSlipService();

  const id = request.params.id;
  const { codBank, numSlip } = request.body;
  const client_id = request.user.id;

  const slip = await downloadSlipService.execute({
    codBank,
    numSlip,
    idSlip: id,
    client_id,
  });

  response.setHeader('Content-Type', 'application/pdf');

  return response.send(slip);
});

export default slipsRouter;
