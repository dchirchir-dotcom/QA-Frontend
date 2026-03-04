import test from '../helper/baseTests'

test.beforeEach(async ({common})=>{
  await common.loadSite();
});

test.describe('Itibari site UI', ()=>{
  test('Login and verify successful navigation', async ({ page, common, loginPage }) => {
    await loginPage.login("itibari@gmail.com", "password");
    await loginPage.navigateToOrders();
  });
});
