import { FeishuWebhookPayload, GitHubCommentInfo, GithubIssueInfo, GithubPRInfo, GitHubReleaseInfo } from "./types";
export declare class CardBuilder {
    /**
     * 根据PR信息构建飞书消息卡片
     */
    buildPRCard(pr: GithubPRInfo): FeishuWebhookPayload;
    buildIssueCard(issue: GithubIssueInfo): FeishuWebhookPayload;
    buildCommentCard(comment: GitHubCommentInfo): FeishuWebhookPayload;
    buildReleaseCard(release: GitHubReleaseInfo): FeishuWebhookPayload;
    /**
     * 构建头部标题
     */
    private getHeaderTitle;
    private buildPRSummary;
    private buildIssueSummary;
    private buildCommentSummary;
    private buildReleaseSummary;
    private buildBodyElement;
    private buildTimestampElement;
    /**
     * 构建操作按钮
     */
    private buildURLButton;
}
//# sourceMappingURL=card-builder.d.ts.map