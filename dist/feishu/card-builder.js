"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardBuilder = void 0;
class CardBuilder {
    /**
     * 根据PR信息构建飞书消息卡片
     */
    buildPRCard(pr) {
        const card = {
            schema: "2.0",
            header: {
                title: this.getHeaderTitle(pr.full_name, pr.title, "pull_request", pr.number),
                template: "blue",
            },
            body: {
                elements: [
                    this.buildPRSummary(pr.action, pr.state, pr.merged, pr),
                    ...((pr.action === "opened" || pr.action === "ready_for_review") &&
                        pr.body !== ""
                        ? [{ tag: "hr" }, this.buildBodyElement(pr.body)]
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
    buildReviewCard(review) {
        const card = {
            schema: "2.0",
            header: {
                title: this.getHeaderTitle(review.full_name, review.title, "pull_request", review.number),
                template: "blue",
            },
            body: {
                elements: [
                    this.buildReviewSummary(review.action, review.state, review),
                    ...(review.action === "submitted" && review.body !== ""
                        ? [{ tag: "hr" }, this.buildBodyElement(review.body)]
                        : []),
                    this.buildURLButton(review.html_url),
                ],
            },
        };
        return {
            msg_type: "interactive",
            card: card,
        };
    }
    buildIssueCard(issue) {
        const card = {
            schema: "2.0",
            header: {
                title: this.getHeaderTitle(issue.full_name, issue.title, "issues", issue.number),
                template: "blue",
            },
            body: {
                elements: [
                    this.buildIssueSummary(issue.action, issue.state, issue),
                    ...(issue.action === "opened" && issue.body !== ""
                        ? [{ tag: "hr" }, this.buildBodyElement(issue.body)]
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
    buildCommentCard(comment) {
        const card = {
            schema: "2.0",
            header: {
                title: this.getHeaderTitle(comment.full_name, comment.title, comment.issue_type, comment.number),
                template: "blue",
            },
            body: {
                elements: [
                    this.buildCommentSummary(comment),
                    this.buildBodyElement(comment.body),
                    this.buildURLButton(comment.html_url),
                ],
            },
        };
        return {
            msg_type: "interactive",
            card: card,
        };
    }
    buildReleaseCard(release) {
        const card = {
            schema: "2.0",
            header: {
                title: this.getHeaderTitle(release.full_name, release.title, "release"),
                template: "blue",
            },
            body: {
                elements: [
                    this.buildReleaseSummary(release),
                    this.buildBodyElement(release.body),
                    this.buildURLButton(release.html_url),
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
    getHeaderTitle(fullName, title, eventType, number) {
        switch (eventType) {
            case "pull_request": {
                const suffix = number ? ` (PR #${number})` : "";
                return {
                    tag: "plain_text",
                    content: `[${fullName}] ${title}${suffix}`,
                };
            }
            case "issues": {
                const suffix = number ? ` (Issue #${number})` : "";
                return {
                    tag: "plain_text",
                    content: `[${fullName}] ${title}${suffix}`,
                };
            }
            case "release": {
                return {
                    tag: "plain_text",
                    content: `[${fullName}] ${title}`,
                };
            }
            default:
                return {
                    tag: "plain_text",
                    content: `[${fullName}] ${title} (${eventType})`,
                };
        }
    }
    buildPRSummary(action, state, merged, pr) {
        let content = "";
        let iconToken = "";
        let iconColor = "blue";
        const authorInfo = `[@${pr.sender.login}](${pr.sender.html_url})`;
        const branchInfo = `(<text_tag color='neutral'>${pr.head.label}</text_tag> → <text_tag color='neutral'>${pr.base.label}</text_tag> )`;
        if (merged) {
            content = `${authorInfo} 合并了这项 Pull request ${branchInfo}`;
            iconToken = "yes_outlined";
            iconColor = "green";
        }
        else if (state === "closed" && !merged) {
            content = `${authorInfo} 关闭了这项 Pull request ${branchInfo}`;
            iconToken = "more-close_outlined";
            iconColor = "red";
        }
        else if (action === "reopened") {
            iconToken = "replace_outlined";
            content = `${authorInfo} 重新打开了这项 Pull request ${branchInfo}`;
        }
        else if (action === "opened" || action === "ready_for_review") {
            iconToken = "privacy-location_outlined";
            content = `${authorInfo} 创建了一项新 Pull request ${branchInfo}`;
        }
        else if (action === "review_requested") {
            iconToken = "member-new_outlined";
            const reviewersInfo = pr.reviewers
                ?.map((reviewer) => {
                return `[@${reviewer.login}](${reviewer.html_url})`;
            })
                .join(" ");
            content = `${authorInfo} 请求 ${reviewersInfo} 对这项 Pull request 开展代码审查 ${branchInfo}`;
        }
        else {
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
    buildReviewSummary(action, state, review) {
        let content = "";
        let iconToken = "";
        let iconColor = "blue";
        const reviewerInfo = `[@${review.reviewer.login}](${review.reviewer.html_url})`;
        const branchInfo = `(<text_tag color='neutral'>${review.head.label}</text_tag> → <text_tag color='neutral'>${review.base.label}</text_tag> )`;
        if (state === "approved") {
            content = `${reviewerInfo} 审查并同意了这项 Pull request ${branchInfo}`;
            iconToken = "yes_outlined";
            iconColor = "green";
        }
        else if (state === "commented") {
            content = `${reviewerInfo} 审查并留下了对这项 Pull request ${branchInfo} 的评论`;
            iconToken = "chat_outlined";
        }
        else if (state === "changes_requested") {
            content = `${reviewerInfo} 审查并认为这项 Pull request ${branchInfo} 需要改动`;
            iconToken = "feedback_outlined";
            iconColor = "red";
        }
        else {
            content = `${reviewerInfo} 更新了对这项 Pull request ${branchInfo} 的审查`;
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
    buildIssueSummary(action, state, issue) {
        let content = "";
        let iconToken = "";
        let iconColor = "blue";
        const authorInfo = `[@${issue.sender.login}](${issue.sender.html_url})`;
        if (state === "closed") {
            content = `${authorInfo} 关闭了这项 Issue`;
            iconToken = "yes_outlined";
            iconColor = "green";
        }
        else if (action === "reopened") {
            content = `${authorInfo} 重新打开了这项 Issue`;
            iconToken = "replace_outlined";
        }
        else if (action === "opened") {
            content = `${authorInfo} 创建了一项新 Issue`;
            iconToken = "pin_outlined";
        }
        else {
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
    buildCommentSummary(comment) {
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
    buildReleaseSummary(release) {
        const authorInfo = `[@${release.sender.login}](${release.sender.html_url})`;
        const tagInfo = `(<text_tag color='neutral'>${release.tag_name}</text_tag>)`;
        let content;
        if (release.prerelease) {
            content = `${authorInfo} 预发布了一个新版本 ${tagInfo}：`;
        }
        else {
            content = `${authorInfo} 发布了一个新版本 ${tagInfo}：`;
        }
        return {
            tag: "div",
            text: {
                tag: "lark_md",
                content: content,
            },
            icon: {
                tag: "standard_icon",
                token: "start_outlined",
                color: "blue",
            },
        };
    }
    buildBodyElement(comment) {
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
    buildTimestampElement(operator, url, time) {
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
    buildURLButton(url) {
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
exports.CardBuilder = CardBuilder;
//# sourceMappingURL=card-builder.js.map