import { BaseCardElement, BaseText, FeishuCard } from "./feishu-card";
import { FeishuWebhookPayload, GithubPRInfo, GithubIssueInfo } from "./types";
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
        subtitle: this.getPRHeaderSubtitle(
          pr.action,
          pr.state,
          pr.merged,
          pr.sender.login,
          pr
        ),
        template: "blue",
      },
      body: {
        elements: [
          this.buildCommentElement(pr.body),
          this.buildAuthorElement(pr.sender.login, pr.sender.html_url),
          this.buildTimeElement(
            pr.action === "opened" ? pr.created_at : pr.updated_at
          ),
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
          "issue",
          issue.number
        ),
        subtitle: this.getIssueHeaderSubtitle(
          issue.action,
          issue.state,
          issue.sender.login
        ),
        template: "blue",
      },
      body: {
        elements: [
          this.buildCommentElement(issue.body),
          this.buildAuthorElement(issue.sender.login, issue.sender.html_url),
          this.buildTimeElement(
            issue.action === "opened" ? issue.created_at : issue.updated_at
          ),
          this.buildURLButton(issue.html_url),
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
    eventType: "pull_request" | "issue",
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

  private getPRHeaderSubtitle(
    action: string,
    state: string,
    merged: boolean,
    operator: string,
    pr: GithubPRInfo
  ): BaseText {
    let content = "";
    if (merged)
      content = `@**${operator}** 合并了 Pull request \`${pr.head.label}\` → \`${pr.base.label}\``;
    else if (state === "closed" && !merged)
      content = `@**${operator}** 关闭了 Pull request`;
    else if (action === "reopened")
      content = `@**${operator}** 重新打开了 Pull request`;
    else if (action === "opened" || "ready_for_review")
      content = `@**${operator}** 创建了新 Pull request`;
    else if (action === "review_requested")
      content = `@**${operator}** 请求代码审查 Pull request`;
    else content = `@**${operator}** 更新了 Pull request`;

    return {
      tag: "lark_md",
      content: content,
    };
  }

  private getIssueHeaderSubtitle(
    action: string,
    state: string,
    operator: string
  ): BaseText {
    let content = "";
    if (state === "closed") content = `**${operator}** 关闭了 Issue`;
    else if (action === "reopened")
      content = `@**${operator}** 重新打开了 Issue`;
    else if (action === "opened")
      content = `@**${operator}** 创建了新 Issue`;
    else content = `@**${operator}** 更新了 Issue`;

    return {
      tag: "lark_md",
      content: content,
    };
  }

  private buildCommentElement(comment: string): BaseCardElement {
    return {
      tag: "div",
      text: {
        tag: "lark_md",
        content: comment,
      },
    };
  }

  /**
   * 构建作者信息元素
   */
  private buildAuthorElement(operator: string, url?: string): BaseCardElement {
    let content = "";
    if (url) content = `**操作用户**: [${operator}](${url})`;
    else content = `**操作用户**: ${operator}`;
    return {
      tag: "div",
      text: {
        tag: "lark_md",
        content: content,
      },
    };
  }

  /**
   * 构建时间信息元素
   */
  private buildTimeElement(time: string): BaseCardElement {
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
        content: `**操作时间**: ${formattedTime}`,
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
