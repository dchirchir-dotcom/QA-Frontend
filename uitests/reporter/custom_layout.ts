import { Block, KnownBlock } from "@slack/types";
import { SummaryResults } from "playwright-slack-report/dist/src";
import _config from "../config/configManager";


export async function generateCustomLayoutAsync(summaryResults: SummaryResults): Promise<Array<KnownBlock | Block>> {
  const { tests } = summaryResults;
  const buildName = process.env.GITHUB_ACTION_NAME || 'Unknown Build Name';

  const header = {
    type: "header",
    text: {
      type: "plain_text",
      text: "🎭 Playwright Test Results - " + buildName,
      emoji: true,
    },
  };

  const summary = {
  type: "section",
  text: {
    type: "mrkdwn",
    text: `✅ *${summaryResults.passed}* | ❌ *${summaryResults.failed}* | ⏩ *${summaryResults.skipped}*`,
  },
};

const buildUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

const buildLinkSection = {
  type: "section",
  text: {
    type: "mrkdwn",
    text: `🔗 *GitHub Build URL:* <${buildUrl}|View Build>`,
  },
};

  const fails: Array<KnownBlock | Block> = [];

  for (const t of tests) {
    if (t.status === "failed" || t.status === "timedOut") {

      const suiteName = t.suiteName || "Unknown suite";
      const testName = t.name || "Unknown test";
      const reason = t.reason || "No reason provided";

      const browser = t.browser
        ? `Browser: ${t.browser}`
        : "Browser: Not specified";

      const projectName = t.projectName
        ? `Project: ${t.projectName}`
        : "Project: Not specified";

      const startedAt = t.startedAt
        ? `Started at: ${t.startedAt}`
        : "Started at: Unknown";

      const endedAt = t.endedAt
        ? `Ended at: ${t.endedAt}`
        : "Ended at: Unknown";

        const lastReason = reason.match(/Error: .+?(?=\nError:|$)/gs);
      let lastError = '';
      if (lastReason && lastReason.length > 0) {
        lastError = lastReason[lastReason.length - 1]; // Get the last matched error
      } else {
        console.log("No errors found.");
      }

    fails.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `❌ *${suiteName}**Test:* ${testName}*Reason:* ${lastError}${browser}${projectName}${startedAt}${endedAt}`,
      },
});
    }
  }

  const footer = {
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "Test execution completed. Failure report.",
      },
    ],
  };

  return [header, summary, buildLinkSection, { type: "divider" }, ...fails, footer];
}