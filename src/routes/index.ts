import { Router } from 'express';

import clientsRouter from './clients.routes';
import sessionsRouter from './sessions.routes';
import invoicesRouter from './invoices.router';
import slipsRouter from './slips.router';

const routes = Router();

routes.use('/clients', clientsRouter);
routes.use('/sessions', sessionsRouter);
routes.use('/invoices', invoicesRouter);
routes.use('/slips', slipsRouter);

export default routes;
