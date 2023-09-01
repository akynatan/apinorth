import { Router } from 'express';

import ListInvoicesService from '@services/invoices/ListInvoicesService';
import isAuthenticated from '@middlewares/isAuthenticated';
import DownloadInvoiceService from '@services/invoices/DownloadInvoiceService';

const invoicesRouter = Router();

invoicesRouter.use(isAuthenticated);

invoicesRouter.get('/', async (request, response) => {
  const listInvoicesService = new ListInvoicesService();

  const client_id = request.user.id;

  const invoices = await listInvoicesService.execute(client_id);

  return response.json(invoices);
});

invoicesRouter.post('/:id/download', async (request, response) => {
  const downloadInvoiceService = new DownloadInvoiceService();

  const invoice_id = request.params.id;
  const client_id = request.user.id;

  const invoice = await downloadInvoiceService.execute(invoice_id, client_id);

  response.setHeader('Content-Type', 'application/pdf');

  return response.send(invoice);
});

export default invoicesRouter;
