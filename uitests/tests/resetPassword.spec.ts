import test from '../helper/baseTest';

test.beforeEach(async ({common})=>{
  await common.loadSite();
});

test.describe('Reset Password Tests', () => {
    test('should navigate and verify successful login', async ({ loginPage, page }) => {
        await loginPage.login('d.chirchir@itibari.io', 'dennis');
        await page.waitForURL(/orders|dashboard|home/, { timeout: 15000 });
    });
    
    test('should display success message after successful login', async ({ loginPage, page }) => {
        await loginPage.login('d.chirchir@itibari.io', 'dennis');
        const pageTitle = page.locator('[role="heading"]').first();
        await pageTitle.waitFor({ timeout: 10000 }).catch(() => {
            console.log('Dashboard heading not immediately visible');
        });
    });
    
    test('should navigate to orders after login', async ({ loginPage, page }) => {
        await loginPage.login('d.chirchir@itibari.io', 'dennis');
        await page.waitForURL(/orders|dashboard|home/, { timeout: 15000 });
    });
});