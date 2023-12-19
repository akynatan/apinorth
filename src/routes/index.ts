import { Router } from 'express';

import clientsRouter from './clients.routes';
import sessionsRouter from './sessions.routes';
import invoicesRouter from './invoices.router';
import slipsRouter from './slips.router';
import passwordRouter from './password.routes';
import profileRouter from './profile.routes';

const routes = Router();

routes.use('/clients', clientsRouter);
routes.use('/sessions', sessionsRouter);
routes.use('/invoices', invoicesRouter);
routes.use('/slips', slipsRouter);
routes.use('/password', passwordRouter);
routes.use('/profile', profileRouter);

export default routes;
