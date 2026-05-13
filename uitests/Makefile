testDev:
	ENVIRONMENT=DEVELOPMENT npx playwright test --grep '@Warehouse' --project=chromium-auth --workers=1

prodTest:
	ENVIRONMENT=PRODUCTION npx playwright test --grep '@Warehouse' --project=chromium-auth --workers=1

testAll:
	npx playwright test tests/userManagement.spec.ts --headed --project=chromium-auth --workers=1

testUserManagement:
	npx playwright test --grep '@usermanagament' --project=chromium-auth --workers=1
