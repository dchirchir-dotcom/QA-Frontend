import 'dotenv/config';
import { devUser, prodUser } from './users';

interface Config {
  baseUrl: string;
  username: string;
  password: string;
}

let _config: Config = {
  baseUrl: '',
  username: '',
  password: '',
};

const PRODUCTION = 'PRODUCTION';
const TEST = 'TEST';

const ENVIRONMENT = process.env.ENVIRONMENT || TEST;

if (ENVIRONMENT === PRODUCTION) {
  _config = {
    baseUrl: process.env.BASE_URL || 'https://micro-dev.itibari.io/',
    username: prodUser.username,
    password: prodUser.password,
  };
} else {
  _config = {
    baseUrl: process.env.BASE_URL || 'https://micro-dev.itibari.io/',
    username: process.env.ITIBARI_USERNAME || devUser.username,
    password: process.env.ITIBARI_PASSWORD || devUser.password,
  };
}

export default _config;
