import test from '../helper/baseTest'

test.beforeEach(async ({common})=>{
  await common.loadSite();
});

test.describe('Itibari site UI', ()=>{
  test('Login and verify successful navigation', {tag: '@Login'}, async ({ page, common, loginPage }) => {
    // Use working credentials
    await loginPage.login("d.chirchir@itibari.io", "dennis");
    // Verify login success by URL navigation
    await page.waitForURL(/orders|dashboard|home/, { timeout: 15000 });
  });
});
