import { BaseCardElement, BaseText, FeishuCard } from "./feishu-card";
import {
  FeishuWebhookPayload,
  GitHubCommentInfo,
  GithubIssueInfo,
  GithubPRInfo,
} from "./types";
export class CardBuilder {
  /**
   * 根据PR信息构建飞书消息卡片
   */
  buildPRCard(pr: GithubPRInfo): FeishuWebhookPayload {
    const card: FeishuCard = {
      schema: "2.0",
      header: {
        title: this.getHeaderTitle(
          pr.full_name,
          pr.title,
          "pull_request",
          pr.number
        ),
        template: "blue",
      },
      body: {
        elements: [
          this.buildPRSummary(pr.action, pr.state, pr.merged, pr),
          ...(pr.body !== ""
            ? [{ tag: "hr" }, this.buildCommentElement(pr.body)]
            : []),
          this.buildURLButton(pr.html_url),
        ],
      },
    };

    return {
      msg_type: "interactive",
      card: card,
    };
  }

  buildIssueCard(issue: GithubIssueInfo): FeishuWebhookPayload {
    const card: FeishuCard = {
      schema: "2.0",
      header: {
        title: this.getHeaderTitle(
          issue.full_name,
          issue.title,
          "issues",
          issue.number
        ),
        template: "blue",
      },
      body: {
        elements: [
          this.buildIssueSummary(issue.action, issue.state, issue),
          ...(issue.body !== ""
            ? [{ tag: "hr" }, this.buildCommentElement(issue.body)]
            : []),
          this.buildURLButton(issue.html_url),
        ],
      },
    };

    return {
      msg_type: "interactive",
      card: card,
    };
  }

  buildCommentCard(comment: GitHubCommentInfo): FeishuWebhookPayload {
    const card: FeishuCard = {
      schema: "2.0",
      header: {
        title: this.getHeaderTitle(
          comment.full_name,
          comment.title,
          comment.issue_type,
          comment.number
        ),
        template: "blue",
      },
      body: {
        elements: [
          this.buildCommentSummary(comment),
          ...(comment.body !== ""
            ? [{ tag: "hr" }, this.buildCommentElement(comment.body)]
            : []),
          this.buildURLButton(comment.html_url),
        ],
      },
    };

    return {
      msg_type: "interactive",
      card: card,
    };
  }

  /**
   * 构建头部标题
   */
  private getHeaderTitle(
    fullName: string,
    title: string,
    eventType: "pull_request" | "issues",
    number: number
  ): BaseText {
    if (eventType === "pull_request")
      return {
        tag: "plain_text",
        content: `[${fullName}] ${title} (PR #${number})`,
      };
    else
      return {
        tag: "plain_text",
        content: `[${fullName}] ${title} (Issue #${number})`,
      };
  }

  private buildPRSummary(
    action: string,
    state: string,
    merged: boolean,
    pr: GithubPRInfo
  ): BaseCardElement {
    let content = "";
    const authorInfo = `[@${pr.sender.login}](${pr.sender.html_url})`;
    const branchInfo = `(<text_tag color='neutral'>${pr.head.label}</text_tag> → <text_tag color='neutral'>${pr.base.label}</text_tag> )`;

    if (merged) content = `${authorInfo} 合并了 Pull request ${branchInfo}`;
    else if (state === "closed" && !merged)
      content = `${authorInfo} 关闭了 Pull request ${branchInfo}`;
    else if (action === "reopened")
      content = `${authorInfo} 重新打开了 Pull request ${branchInfo}`;
    else if (action === "opened" || "ready_for_review")
      content = `${authorInfo} 创建了新 Pull request ${branchInfo}`;
    else if (action === "review_requested")
      content = `${authorInfo} 请求代码审查 Pull request ${branchInfo}`;
    else content = `${authorInfo} 更新了 Pull request`;

    return {
      tag: "div",
      text: {
        tag: "lark_md",
        content: content,
      },
      icon: {
        tag: "standard_icon",
        token: "yes_outlined",
        color: "blue",
      },
    };
  }

  private buildIssueSummary(
    action: string,
    state: string,
    issue: GithubIssueInfo
  ): BaseCardElement {
    let content = "";
    const authorInfo = `[@${issue.sender.login}](${issue.sender.html_url})`;
    if (state === "closed") content = `${authorInfo} 关闭了 Issue`;
    else if (action === "reopened") content = `${authorInfo} 重新打开了 Issue`;
    else if (action === "opened") content = `${authorInfo} 创建了新 Issue`;
    else content = `${authorInfo} 更新了 Issue`;

    return {
      tag: "div",
      text: {
        tag: "lark_md",
        content: content,
      },
      icon: {
        tag: "standard_icon",
        token: "yes_outlined",
        color: "blue",
      },
    };
  }

  private buildCommentSummary(comment: GitHubCommentInfo): BaseCardElement {
    const authorInfo = `[@${comment.sender.login}](${comment.sender.html_url})`;
    const content = `${authorInfo} 添加了新评论`;

    return {
      tag: "div",
      text: {
        tag: "lark_md",
        content: content,
      },
      icon: {
        tag: "standard_icon",
        token: "yes_outlined",
        color: "blue",
      },
    };
  }

  private buildCommentElement(comment: string): BaseCardElement {
    return {
      tag: "markdown",
      content: comment,
      icon: {
        tag: "standard_icon",
        token: "chat_outlined",
        color: "blue",
      },
    };
  }

  private buildTimestampElement(
    operator: string,
    url: string,
    time: string
  ): BaseCardElement {
    const formattedTime = new Date(time).toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return {
      tag: "div",
      text: {
        tag: "lark_md",
        content: `[@${operator}](${url}) | ${formattedTime}`,
      },
    };
  }

  /**
   * 构建操作按钮
   */
  private buildURLButton(url: string): BaseCardElement {
    return {
      tag: "button",
      text: {
        tag: "plain_text",
        content: "在 GitHub 上查看",
      },
      type: "primary",
      behaviors: [
        {
          type: "open_url",
          default_url: url,
        },
      ],
    };
  }
}
