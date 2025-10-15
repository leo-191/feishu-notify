import { FeishuWebhookPayload, GitHubCommentInfo, GithubIssueInfo, GithubPRInfo } from "./types";
export declare class CardBuilder {
    /**
     * 根据PR信息构建飞书消息卡片
     */
    buildPRCard(pr: GithubPRInfo): FeishuWebhookPayload;
    buildIssueCard(issue: GithubIssueInfo): FeishuWebhookPayload;
    buildCommentCard(comment: GitHubCommentInfo): FeishuWebhookPayload;
    /**
     * 构建头部标题
     */
    private getHeaderTitle;
    private buildPRSummary;
    private buildIssueSummary;
    private buildCommentSummary;
    private buildCommentElement;
    private buildTimestampElement;
    /**
     * 构建操作按钮
     */
    private buildURLButton;
}
//# sourceMappingURL=card-builder.d.ts.map