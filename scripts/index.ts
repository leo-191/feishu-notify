import { FeishuBotClient } from "./feishu/client";
import { CardBuilder } from "./feishu/card-builder";
import { GithubPRInfo } from "./feishu/types";

async function run() {
  try {
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

    // const eventAction = eventData.action;
    // const eventName = eventData.pull_request
    //   ? "pull_request"
    //   : eventData.event_name;

    // const isDraft = eventData.pull_request?.draft === false;
    // const allowedActions = [
    //   "opened",
    //   "closed",
    //   "reopened",
    //   "ready_for_review",
    //   "review_requested",
    //   "synchronize",
    // ];

    // if (isDraft) {
    //   console.log(
    //     `忽略事件: ${eventName} (action: ${eventAction}, draft: ${isDraft})`
    //   );
    //   return;
    // }

    // if (eventName !== "pull_request" || !allowedActions.includes(eventAction)) {
    //   console.log(
    //     `忽略事件: ${eventName} (action: ${eventAction}, draft: ${isDraft})`
    //   );
    //   return;
    // }

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

    console.log("处理 PR 信息: ", PRInfo);

    const cardBuilder = new CardBuilder();
    const card = cardBuilder.buildPrCard(PRInfo);

    const botClient = new FeishuBotClient(webhookUrl);
    await botClient.sendCard(card);
  } catch (error) {
    console.error("执行过程中发生错误: ", error);
    process.exit(1);
  }
}

run();
