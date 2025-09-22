import { BaseCardElement, BaseText, FeishuCard } from "./feishu-card";
import { FeishuWebhookPayload, GithubPRInfo } from "./types";
export class CardBuilder {
  /**
   * 根据PR信息构建飞书消息卡片
   */
  buildPrCard(pr: GithubPRInfo): FeishuWebhookPayload {
    const card: FeishuCard = {
      schema: "2.0",
      header: {
        title: this.getPRHeaderTitle(pr.full_name, pr.title, pr.number),
        subtitle: this.getPRHeaderSubtitle(
          pr.action,
          pr.state,
          pr.merged,
          pr.number,
          pr
        ),
        template: "blue",
      },
      body: {
        elements: [
          this.buildAuthorElement(pr),
          this.buildTimeElement(pr),
          this.buildURLButton(pr.html_url),
        ],
      },
    };

    return {
      msg_type: "interactive",
      card: card,
    };
  }

  /**
   * 根据PR状态获取头部颜色模板
   */
  // private getHeaderTemplate(
  //   action: string,
  //   state: string,
  //   merged?: boolean
  // ): "green" | "red" | "blue" | "orange" {
  //   if (merged) return "green";
  //   if (state === "closed" && !merged) return "red";
  //   if (action === "opened" || action === "reopened") return "blue";
  //   return "orange";
  // }

  /**
   * 构建头部标题
   */
  private getPRHeaderTitle(
    full_name: string,
    title: string,
    number: number
  ): BaseText {
    return {
      tag: "plain_text",
      content: `[${full_name}] ${title} (PR #${number})`,
    };
  }

  private getPRHeaderSubtitle(
    action: string,
    state: string,
    merged: boolean,
    number: number,
    pr: GithubPRInfo
  ): BaseText {
    let content = "";
    if (merged)
      content = `**${pr.sender.login}** 合并了 PR #${number} \`${pr.head.label}\` → \`${pr.base.label}\``;
    else if (state === "closed" && !merged)
      content = `**${pr.sender.login}** 关闭了 PR #${number}`;
    else if (action === "reopened")
      content = `**${pr.sender.login}** 重新打开了 PR #${number}`;
    else if (action === "opened" || "ready_for_review")
      content = `**${pr.sender.login}** 创建了新 PR #${number}`;
    else if (action === "review_requested")
      content = `**${pr.sender.login}** 请求代码审查 PR #${number}`;
    else content = `**${pr.sender.login}** 更新了 PR #${number}`;

    return {
      tag: "lark_md",
      content: content,
    };
  }

  /**
   * 构建作者信息元素
   */
  private buildAuthorElement(pr: GithubPRInfo): BaseCardElement {
    return {
      tag: "div",
      text: {
        tag: "lark_md",
        content: `**操作用户**: [${pr.sender.login}](${pr.sender.html_url})`,
      },
    };
  }

  /**
   * 构建时间信息元素
   */
  private buildTimeElement(pr: GithubPRInfo): BaseCardElement {
    const time = pr.action === "opened" ? pr.created_at : pr.updated_at;
    const formattedTime = new Date(time).toLocaleString();

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
