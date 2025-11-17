"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const card_builder_1 = require("./feishu/card-builder");
const client_1 = require("./feishu/client");
function getEventTypeFromArgs() {
    const args = process.argv.slice(2);
    const eventTypeIndex = args.indexOf("--event-type");
    if (eventTypeIndex === -1 || !args[eventTypeIndex + 1]) {
        throw new Error("需要通过 --event-type 指定事件类型");
    }
    const eventType = args[eventTypeIndex + 1];
    if (![
        "pull_request",
        "pull_request_review",
        "pull_request_review_comment",
        "issues",
        "issue_comment",
        "release",
    ].includes(eventType)) {
        throw new Error(`事件类型必须是 pull_request, pull_request_review, pull_request_review_comment, \
      issues, issue_comment 或 release，传入参数为 ${eventType}`);
    }
    return eventType;
}
const parsePRInfo = (data) => {
    const PRInfo = {
        action: data.action,
        number: data.pull_request.number,
        full_name: data.pull_request.base.repo.full_name,
        title: data.pull_request.title,
        body: data.pull_request.body || "",
        html_url: data.pull_request.html_url,
        sender: {
            login: data.sender.login,
            html_url: data.sender.html_url,
        },
        draft: data.pull_request.draft,
        state: data.pull_request.state,
        created_at: data.pull_request.created_at,
        updated_at: data.pull_request.updated_at,
        merged: data.pull_request.merged,
        base: {
            label: data.pull_request.base.label,
        },
        head: {
            label: data.pull_request.head.label,
        },
        reviewers: data.pull_request.requested_reviewers?.map((r) => ({
            login: r.login,
            html_url: r.html_url,
        })) ?? undefined,
    };
    console.log("处理 PR 信息:", PRInfo);
    return PRInfo;
};
const parseIssueInfo = (data) => {
    const issueInfo = {
        action: data.action,
        number: data.issue.number,
        full_name: data.repository.full_name,
        title: data.issue.title,
        body: data.issue.body || "",
        html_url: data.issue.html_url,
        sender: {
            login: data.sender.login,
            html_url: data.sender.html_url,
        },
        state: data.issue.state,
        created_at: data.issue.created_at,
        updated_at: data.issue.updated_at,
    };
    console.log("处理 Issue 信息:", issueInfo);
    return issueInfo;
};
const parseIssueCommentInfo = (data) => {
    const commentInfo = {
        action: data.action,
        number: data.issue.number,
        type: data.issue.pull_request ? "pull_request" : "issues",
        full_name: data.repository.full_name,
        title: data.issue.title,
        body: data.comment.body || "",
        html_url: data.comment.html_url,
        sender: {
            login: data.sender.login,
            html_url: data.sender.html_url,
        },
        created_at: data.comment.created_at,
        updated_at: data.comment.updated_at,
    };
    console.log("处理 Issue Comment 信息:", commentInfo);
    return commentInfo;
};
const parseReleaseInfo = (data) => {
    const releaseInfo = {
        action: data.action,
        full_name: data.repository.full_name,
        prerelease: data.release.prerelease,
        tag_name: data.release.tag_name,
        title: data.release.name,
        body: data.release.body || "",
        html_url: data.release.html_url,
        sender: {
            login: data.sender.login,
            html_url: data.sender.html_url,
        },
        created_at: data.release.created_at,
        updated_at: data.release.updated_at,
    };
    console.log("处理 Release Comment 信息:", releaseInfo);
    return releaseInfo;
};
const parseReviewInfo = (data) => {
    const reviewInfo = {
        action: data.action,
        number: data.pull_request.number,
        full_name: data.pull_request.base.repo.full_name,
        title: data.pull_request.title,
        body: data.review.body || "",
        html_url: data.review.html_url,
        state: data.review.state,
        created_at: data.review.submitted_at,
        updated_at: data.review.updated_at,
        base: {
            label: data.pull_request.base.label,
        },
        head: {
            label: data.pull_request.head.label,
        },
        reviewer: {
            login: data.review.user.login,
            html_url: data.review.user.html_url,
        },
    };
    console.log("处理 Review 信息:", reviewInfo);
    return reviewInfo;
};
const parseReviewCommentInfo = (data) => {
    const commentInfo = {
        action: data.action,
        number: data.pull_request.number,
        type: "review",
        full_name: data.repository.full_name,
        title: data.pull_request.title,
        body: data.comment.body || "",
        html_url: data.comment.html_url,
        sender: {
            login: data.sender.login,
            html_url: data.sender.html_url,
        },
        created_at: data.comment.created_at,
        updated_at: data.comment.updated_at,
    };
    console.log("处理 Review Comment 信息:", commentInfo);
    return commentInfo;
};
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
        switch (eventType) {
            case "pull_request": {
                const cardBuilder = new card_builder_1.CardBuilder();
                card = cardBuilder.buildPRCard(parsePRInfo(eventData));
                break;
            }
            case "pull_request_review": {
                const cardBuilder = new card_builder_1.CardBuilder();
                const reviewData = parseReviewInfo(eventData);
                if (reviewData.state === "commented" && reviewData.body === "")
                    process.exit(0);
                card = cardBuilder.buildReviewCard(reviewData);
                break;
            }
            case "pull_request_review_comment": {
                const cardBuilder = new card_builder_1.CardBuilder();
                card = cardBuilder.buildCommentCard(parseReviewCommentInfo(eventData));
                break;
            }
            case "issues": {
                const cardBuilder = new card_builder_1.CardBuilder();
                card = cardBuilder.buildIssueCard(parseIssueInfo(eventData));
                break;
            }
            case "issue_comment": {
                const cardBuilder = new card_builder_1.CardBuilder();
                card = cardBuilder.buildCommentCard(parseIssueCommentInfo(eventData));
                break;
            }
            case "release": {
                const cardBuilder = new card_builder_1.CardBuilder();
                card = cardBuilder.buildReleaseCard(parseReleaseInfo(eventData));
                break;
            }
            default:
                throw new Error(`未知的事件类型: ${eventType}`);
                break;
        }
        const botClient = new client_1.FeishuBotClient(webhookUrl);
        await botClient.sendCard(card);
    }
    catch (error) {
        console.error("执行过程中发生错误: ", error);
        process.exit(1);
    }
}
run();
//# sourceMappingURL=index.js.map