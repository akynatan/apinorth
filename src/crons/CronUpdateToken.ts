import fs from 'fs';
import RestartServerService from '@services/planetphone/RestartServerService';

class CronUpdateToken {
  public async execute(): Promise<void> {
    const restartServer = new RestartServerService();

    const paramsFetch = {
      grant_type: process.env.TOKEN_GRANT_TYPE,
      client_id: process.env.TOKEN_CLIENT_ID,
      client_secret: process.env.TOKEN_CLIENT_SECRET,
      username: process.env.TOKEN_USERNAME,
      password: process.env.TOKEN_PASSWORD,
      host: process.env.TOKEN_HOST,
    };

    const response: any = {}

    const newToken = `export default {\n  token:\n    '${response.data?.access_token}',\n};\n`;

    fs.writeFile(
      `${__dirname}/../config/authApiHubsoft.ts`,
      newToken,
      function (err) {
        if (err) throw err;

        console.log('Replaced!');
        restartServer.execute();
      },
    );
  }
}

export default CronUpdateToken;
