import { test as baseTest } from '@playwright/test'
import { _comnmon } from "./common";
import { _loginPage } from '../pageFactory/login';

const test = baseTest.extend<{
    common: _comnmon;
    loginPage: _loginPage;
}>({
    common: async ({page, context, baseURL}, use)=>{
        await use(new _comnmon(page, context, baseURL))
    },
    loginPage: async ({page}, use)=>{
        await use(new _loginPage(page))
    },
});

export default test;