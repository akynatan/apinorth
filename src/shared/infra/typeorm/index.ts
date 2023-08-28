import { createConnection } from 'typeorm';

createConnection()
  .then(connection => {
    console.log('connection default');
  })
  .catch(error => {
    console.log('connection error database', error);
  });
