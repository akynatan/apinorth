declare namespace NodeJS {
  export interface ProcessEnv {
    TOKEN_GRANT_TYPE: string;
    TOKEN_CLIENT_ID: string;
    TOKEN_CLIENT_SECRET: string;
    TOKEN_USERNAME: string;
    TOKEN_PASSWORD: string;
    TOKEN_HOST: string;
    PORT: string;
  }
}
