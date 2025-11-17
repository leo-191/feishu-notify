[github-repo]: https://github.com/leo-191/feishu-notify
[badge-svg]: https://img.shields.io/badge/Marketplace-blue.svg?colorA=24292e&colorB=0366d6&style=flat&longCache=true&logo=github
[marketplace]: https://github.com/marketplace/actions/notify-to-feishu

# Notify to Feishu [![Notify to Feishu][badge-svg]][marketplace]

<div align="right">
  <span>Engligh  •  <span>
  <a href="/docs/README_zh.md">
    中文
  </a>
</div>
<br/>

A GitHub Action that automatically sends GitHub event notifications (e.g., PRs, Issues, comments) to a Feishu (Lark) group chat.

## Features

- Supports listening to multiple GitHub event types:
  - Pull Requests (opened, closed, reopened, ready_for_review, review_requested, synchronize)
  - Issues (opened, closed, reopened)
  - Issue Comments (created)
- Simple configuration—only requires a Feishu bot webhook URL

## Prerequisites

1. Create a **custom bot** in your Feishu group chat and get the webhook URL:

   - Open your Feishu group chat → Click the top-right "Settings" → "Group Bots" → "Add Bot" → "Custom Bot"
   - Copy the bot's webhook URL (format example: `https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxx`)

2. Store the Feishu webhook as a Secret in your GitHub repository:
   - Go to your repository → "Settings" → "Secrets and variables" → "Actions" → "New repository secret"
   - Name: `FEISHU_WEBHOOK`; Value: Paste the Feishu bot webhook URL → Save

## Usage

Create a workflow file in your GitHub repository (e.g., `.github/workflows/feishu-notify.yml`) and add the following content:

```yaml
name: Feishu Notification
on:
  # List of events to listen to (adjust as needed)
  pull_request:
    types:
      [
        opened,
        closed,
        reopened,
        ready_for_review,
        review_requested,
        synchronize,
      ]
  pull_request_review_comment:
    types: [created]
  pull_request_review:
    types: [submitted]
  issues:
    types: [opened, closed, reopened]
  issue_comment:
    types: [created]
  release:
    types: [published]

jobs:
  notify:
    runs-on: ubuntu-latest
    # Filter out draft PRs and release
    if: |
      !(
        (github.event_name == 'pull_request' && github.event.pull_request.draft) ||
        (github.event_name == 'release' && github.event.release.draft)
      )
    steps:
      - name: Send notification to Feishu
        uses: leo-191/feishu-notify@v1
        with:
          # Reference the Feishu webhook secret stored in your repo
          feishu_webhook: ${{ secrets.FEISHU_WEBHOOK }}
```

## Configuration Parameters

| Parameter      | Required | Description            | Example Value                                         |
| -------------- | -------- | ---------------------- | ----------------------------------------------------- |
| feishu_webhook | Yes      | Feishu bot webhook URL | `https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxx` |

## License

This project is open-source under the MIT License.

## Feedback & Contributions

For issues or feature requests, feel free to submit an Issue or Pull Request.
