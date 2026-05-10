import { Block, KnownBlock } from '@slack/types';
import { SummaryResults } from 'playwright-slack-report/dist/src';

const failedStatuses = new Set(['failed', 'timedOut']);

export async function generateCustomLayoutAsync(summaryResults: SummaryResults): Promise<Array<KnownBlock | Block>> {
  const { tests } = summaryResults;
  const buildName = process.env.GITHUB_ACTION_NAME || 'Unknown Build Name';
  const buildUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

  const header = {
    type: 'header',
    text: {
      type: 'plain_text',
      text: `🎭 Playwright Test Results - ${buildName}`,
      emoji: true,
    },
  };

  const summary = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `✅ *${summaryResults.passed}* | ❌ *${summaryResults.failed}* | ⏩ *${summaryResults.skipped}*`,
    },
  };

  const buildLinkSection = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `🔗 *GitHub Build URL:* <${buildUrl}|View Build>`,
    },
  };

  const fails: Array<KnownBlock | Block> = [];

  for (const t of tests) {
    if (!failedStatuses.has(t.status)) continue;

    const suiteName = t.suiteName || 'Unknown suite';
    const testName = t.name || 'Unknown test';
    const reason = t.reason || 'No reason provided';
    const lastReason = reason.match(/Error: .+?(?=\nError:|$)/gs);
    const lastError = lastReason?.[lastReason.length - 1] || reason;

    fails.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: [
          `❌ *${suiteName}*`,
          `*Test:* ${testName}`,
          `*Reason:* ${lastError}`,
          `*Browser:* ${t.browser || 'Not specified'}`,
          `*Project:* ${t.projectName || 'Not specified'}`,
          `*Started:* ${t.startedAt || 'Unknown'}`,
          `*Ended:* ${t.endedAt || 'Unknown'}`,
        ].join('\n'),
      },
    });
  }

  const footer = {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: 'Test execution completed. Failure report.',
      },
    ],
  };

  return [header, summary, buildLinkSection, { type: 'divider' }, ...fails, footer];
}
