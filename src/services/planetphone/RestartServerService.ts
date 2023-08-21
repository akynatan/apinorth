import { exec } from 'child_process';

class RestartServerService {
  public async execute(): Promise<void> {
    const run = (command: any) =>
      new Promise(resolve => {
        exec(command, (error: any, stdout: any) => {
          if (error) {
            console.error(error);

            process.exit(1);
          }

          console.log(stdout);
          resolve(stdout);
        });
      });

    (async () => {
      run('ls')
        .then(() => console.log('\nDONE\n'))
        .catch(() => console.log('ERRO'));
    })();
  }
}

export default RestartServerService;
