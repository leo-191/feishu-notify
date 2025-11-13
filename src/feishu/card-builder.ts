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
          ...((pr.action === "opened" || pr.action === "ready_for_review") &&
          pr.body !== ""
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
          ...(issue.action === "opened" && issue.body !== ""
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
          this.buildCommentElement(comment.body),
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
    let iconToken = "";
    let iconColor = "blue";
    const authorInfo = `[@${pr.sender.login}](${pr.sender.html_url})`;
    const branchInfo = `(<text_tag color='neutral'>${pr.head.label}</text_tag> → <text_tag color='neutral'>${pr.base.label}</text_tag> )`;

    if (merged) {
      content = `${authorInfo} 合并了这项 Pull request ${branchInfo}`;
      iconToken = "yes_outlined";
      iconColor = "green";
    } else if (state === "closed" && !merged) {
      content = `${authorInfo} 关闭了这项 Pull request ${branchInfo}`;
      iconToken = "more-close_outlined";
      iconColor = "red";
    } else if (action === "reopened") {
      iconToken = "replace_outlined";
      content = `${authorInfo} 重新打开了这项 Pull request ${branchInfo}`;
    } else if (action === "opened" || action === "ready_for_review") {
      iconToken = "privacy-location_outlined";
      content = `${authorInfo} 创建了一项新 Pull request ${branchInfo}`;
    } else if (action === "review_requested") {
      iconToken = "member-new_outlined";
      content = `${authorInfo} 请求对这项 Pull request 开展代码审查 ${branchInfo}`;
    } else {
      iconToken = "replace_outlined";
      content = `${authorInfo} 更新了这项 Pull request ${branchInfo}`;
    }

    return {
      tag: "div",
      text: {
        tag: "lark_md",
        content: content,
      },
      icon: {
        tag: "standard_icon",
        token: iconToken,
        color: iconColor,
      },
    };
  }

  private buildIssueSummary(
    action: string,
    state: string,
    issue: GithubIssueInfo
  ): BaseCardElement {
    let content = "";
    let iconToken = "";
    let iconColor = "blue";
    const authorInfo = `[@${issue.sender.login}](${issue.sender.html_url})`;
    if (state === "closed") {
      content = `${authorInfo} 关闭了这项 Issue`;
      iconToken = "yes_outlined";
      iconColor = "green";
    } else if (action === "reopened") {
      content = `${authorInfo} 重新打开了这项 Issue`;
      iconToken = "replace_outlined";
    } else if (action === "opened") {
      content = `${authorInfo} 创建了一项新 Issue`;
      iconToken = "pin_outlined";
    } else {
      content = `${authorInfo} 更新了这项 Issue`;
      iconToken = "replace_outlined";
    }

    return {
      tag: "div",
      text: {
        tag: "lark_md",
        content: content,
      },
      icon: {
        tag: "standard_icon",
        token: iconToken,
        color: iconColor,
      },
    };
  }

  private buildCommentSummary(comment: GitHubCommentInfo): BaseCardElement {
    const authorInfo = `[@${comment.sender.login}](${comment.sender.html_url})`;
    const content = `${authorInfo} 添加了一条新评论：`;

    return {
      tag: "div",
      text: {
        tag: "lark_md",
        content: content,
      },
      icon: {
        tag: "standard_icon",
        token: "bell_outlined",
        color: "blue",
      },
    };
  }

  private buildCommentElement(comment: string): BaseCardElement {
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;

    return {
      tag: "markdown",
      content: comment.replace(imageRegex, (match, alt, url) => {
      const escapedAlt = alt.replace(/"/g, "&quot;");
      const escapedUrl = url.replace(/"/g, "&quot;");

      return `<img src="${escapedUrl}" alt="${escapedAlt}" />`;
    }),
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
