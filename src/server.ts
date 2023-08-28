import 'reflect-metadata';
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'express-async-errors';

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
  console.log(`🚀 Server started on port ${process.env.PORT || 3333}`);
});
