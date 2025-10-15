import { FeishuCard } from "./feishu-card";
export interface FeishuWebhookPayload {
    msg_type: "interactive";
    card: FeishuCard;
}
export interface GithubPRInfo {
    action: string;
    number: number;
    full_name: string;
    title: string;
    body: string;
    html_url: string;
    sender: {
        login: string;
        html_url: string;
    };
    draft: boolean;
    state: string;
    created_at: string;
    updated_at: string;
    merged: boolean;
    base: {
        label: string;
    };
    head: {
        label: string;
    };
}
export interface GithubIssueInfo {
    action: string;
    number: number;
    full_name: string;
    title: string;
    body: string;
    html_url: string;
    sender: {
        login: string;
        html_url: string;
    };
    state: string;
    created_at: string;
    updated_at: string;
}
export interface GitHubCommentInfo {
    action: string;
    number: number;
    issue_type: "issues" | "pull_request";
    full_name: string;
    title: string;
    body: string;
    html_url: string;
    sender: {
        login: string;
        html_url: string;
    };
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=types.d.ts.map