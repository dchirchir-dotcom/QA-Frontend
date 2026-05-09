import _config from './config/configManager';
import { type PlaywrightTestConfig, devices } from '@playwright/test';
import { LogLevel } from '@slack/web-api';
import { generateCustomLayoutAsync } from './reporter/custom_layout';
import dotenv from 'dotenv';
dotenv.config();


const authFile = 'playwright/.auth/user.json';
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
const gitHubRefName = process.env.GITHUB_REF_NAME || process.env.GITHUB_REF?.replace('refs/heads/', '');
const shouldReportToSlack = Boolean(slackWebhookUrl) && (!process.env.CI || gitHubRefName === 'main');
const sendResultsValue = shouldReportToSlack
  ? process.env.SLACK_SEND_RESULTS || 'on-failure'
  : 'off';

const config: PlaywrightTestConfig = {
  //testDir: './tests/**',
  /* Maximum time one test can run for. */
  //timeout: 240000,
  timeout: 300000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in ⁠ await expect(locator).toHaveText(); ⁠
     */
    timeout: 5000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 5 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */

  //npm i playwright-slack-report

  reporter: shouldReportToSlack
    ? [
      [
        "./node_modules/playwright-slack-report/dist/src/SlackReporter.js",
        {
          slackWebHookUrl: slackWebhookUrl, // qa-alerts
          sendResults: sendResultsValue, // "always" , "on-failure", "off"
          layoutAsync: generateCustomLayoutAsync,
          slackLogLevel: LogLevel.ERROR,
          disableUnfurl: true,
        },
      ],
      ['playwright-ctrf-json-reporter', { outputDir: './test-results', screenshot: true }],
      ['list'],
    ]
    : [
        ['html'],
        ['junit', { outputFile: './playwright-report/results.xml' }],
        [
          'playwright-ctrf-json-reporter',
          { outputDir: './test-results', screenshot: true },
        ],
        ['list'],
        [
          'monocart-reporter',
          {
            name: 'My Test Report',
            outputFile: './test-results/report.html',
          },
        ],
      ],

  use: {
    baseURL: _config.baseUrl,
    trace: 'on-first-retry',
  },



/**
 * See https://playwright.dev/docs/test-configuration.
 */
  /* Configure projects for major browsers */
  projects: [
    /* Refreshes playwright/.auth/user.json when MFA/login is needed. */
    { name: 'setup', testDir: '.', testMatch: /auth\.setup\.ts/ },

    /* Day-to-day logged-in runs: reuse the saved auth state and do not rerun setup. */
    {
      name: 'chromium-auth',
      use: { ...devices['Desktop Chrome'], storageState: authFile },
    },

    /* Full authenticated run: refresh auth first, then execute tests with that state. */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: authFile },
      dependencies: ['setup'],
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'], storageState: authFile },
    //   dependencies: ['setup'],
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'], storageState: authFile },
    //   dependencies: ['setup'],
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  };
  export default config;
