testDev:
	ENVIRONMENT=DEVELOPMENT npx playwright test --grep '@Warehouse'

prodTest:
	ENVIRONMENT=PRODUCTION npx playwright test --grep '@Warehouse'

testAll:
	npx playwright test tests/userManagement.spec.ts --headed --project=chromium --no-deps

testUserManagement:
	npx playwright test --grep '@usermanagament' --project=chromium-auth --workers=1
