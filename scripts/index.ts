import { FeishuBotClient } from "./feishu/client";
import { CardBuilder } from "./feishu/card-builder";
import {
  GithubPRInfo,
  GithubIssueInfo,
  GitHubCommentInfo,
} from "./feishu/types";

function getEventTypeFromArgs(): string {
  const args = process.argv.slice(2);

  const eventTypeIndex = args.indexOf("--event-type");
  if (eventTypeIndex === -1 || !args[eventTypeIndex + 1]) {
    throw new Error("需要通过 --event-type 指定事件类型");
  }

  const eventType = args[eventTypeIndex + 1];
  if (!["pull_request", "issues", "issue_comment"].includes(eventType)) {
    throw new Error("事件类型必须是 pull_request, issues 或 issue_comment");
  }

  return eventType;
}

async function run() {
  try {
    const eventType = getEventTypeFromArgs();
    const webhookUrl = process.env.FEISHU_WEBHOOK;
    const eventPath = process.env.GITHUB_EVENT_PATH;

    if (!webhookUrl) {
      throw new Error("未设置 FEISHU_WEBHOOK 环境变量");
    }

    if (!eventPath) {
      throw new Error("未找到 GITHUB_EVENT_PATH 环境变量");
    }

    const fs = require("fs");
    const eventData = JSON.parse(fs.readFileSync(eventPath, "utf8"));

    let card;
    if (eventType === "pull_request") {
      const PRInfo: GithubPRInfo = {
        action: eventData.action,
        number: eventData.pull_request.number,
        full_name: eventData.pull_request.base.repo.full_name,
        title: eventData.pull_request.title,
        body: eventData.pull_request.body || "",
        html_url: eventData.pull_request.html_url,
        sender: {
          login: eventData.sender.login,
          html_url: eventData.sender.html_url,
        },
        draft: eventData.pull_request.draft,
        state: eventData.pull_request.state,
        created_at: eventData.pull_request.created_at,
        updated_at: eventData.pull_request.updated_at,
        merged: eventData.pull_request.merged,
        base: {
          label: eventData.pull_request.base.label,
        },
        head: {
          label: eventData.pull_request.head.label,
        },
      };

      console.log("处理 PR 信息:", PRInfo);

      const cardBuilder = new CardBuilder();
      card = cardBuilder.buildPRCard(PRInfo);
    } else if (eventType === "issues") {
      const issueInfo: GithubIssueInfo = {
        action: eventData.action,
        number: eventData.issue.number,
        full_name: eventData.repository.full_name,
        title: eventData.issue.title,
        body: eventData.issue.body || "",
        html_url: eventData.issue.html_url,
        sender: {
          login: eventData.sender.login,
          html_url: eventData.sender.html_url,
        },
        state: eventData.issue.state,
        created_at: eventData.issue.created_at,
        updated_at: eventData.issue.updated_at,
      };

      console.log("处理 Issue 信息:", issueInfo);

      const cardBuilder = new CardBuilder();
      card = cardBuilder.buildIssueCard(issueInfo);
    } else if (eventType === "issue_comment") {
      const commentInfo: GitHubCommentInfo = {
        action: eventData.action,
        number: eventData.issue.number,
        issue_type: eventData.issue.pull_request ? "pull_request" : "issues",
        full_name: eventData.repository.full_name,
        title: eventData.issue.title,
        body: eventData.comment.body || "",
        html_url: eventData.comment.html_url,
        sender: {
          login: eventData.sender.login,
          html_url: eventData.sender.html_url,
        },
        created_at: eventData.comment.created_at,
        updated_at: eventData.comment.updated_at,
      };

      console.log("处理 Issue Comment 信息:", commentInfo);

      const cardBuilder = new CardBuilder();
      card = cardBuilder.buildCommentCard(commentInfo);
    } else {
      throw new Error(`未知的事件类型: ${eventType}`);
    }

    const botClient = new FeishuBotClient(webhookUrl);
    await botClient.sendCard(card);
  } catch (error) {
    console.error("执行过程中发生错误: ", error);
    process.exit(1);
  }
}

run();
