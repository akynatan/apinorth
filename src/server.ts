import 'reflect-metadata';
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cron from 'node-cron';
import 'express-async-errors';

import CronUpdateToken from '@crons/CronUpdateToken';

import AppError from './shared/errors/AppError';
import routes from './routes';

import '@shared/infra/typeorm';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response
      .status(err.statusCode)
      .json({ status: 'error', error: err.message });
  }
  console.log(err);

  return response.status(500).json({
    status: 'error',
    error: 'Internal server error..',
  });
});

app.listen(Number(process.env.PORT) || 3333, () => {
  const cronUpdateToken = new CronUpdateToken();

  cron.schedule('0 0 5,10,15,25,1 * *', () => cronUpdateToken.execute(), {
    timezone: 'America/Sao_Paulo',
  });

  console.log(`🚀 Server started on port ${process.env.PORT || 3333}`);
});
