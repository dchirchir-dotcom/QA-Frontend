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
  timeout: 300000,
  expect: {
    timeout: 5000,
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 5 : undefined,

  reporter: shouldReportToSlack
    ? [
        [
          './node_modules/playwright-slack-report/dist/src/SlackReporter.js',
          {
            slackWebHookUrl: slackWebhookUrl,
            sendResults: sendResultsValue,
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
        ['playwright-ctrf-json-reporter', { outputDir: './test-results', screenshot: true }],
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

  projects: [
    { name: 'setup', testDir: '.', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium-auth',
      use: { ...devices['Desktop Chrome'], storageState: authFile },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: authFile },
      dependencies: ['setup'],
    },
  ],

  outputDir: 'test-results/',
};

export default config;
