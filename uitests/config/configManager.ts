import { devUser, prodUser } from "./users";

interface Config {
    baseUrl: string;
    username: string;
    password: string;
}
let _config: Config=  {
    baseUrl: '',
    username: '',
    password: ''
};

const PRODUCTION = 'PRODUCTION';
const TEST = 'TEST';

const ENVIRONMENT = process.env.ENVIRONMENT || TEST;

if (ENVIRONMENT === PRODUCTION) {
    _config = {
        baseUrl: 'https://dev.itibari.io/',
        username: prodUser.username,
        password: prodUser.password   
    };
} else {
    _config = {
        baseUrl: 'https://dev.itibari.io/',
        username: devUser.username,
        password: devUser.password
    };
}

export default _config;
