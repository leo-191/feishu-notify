[github-repo]: https://github.com/leo-191/feishu-notify
[badge-svg]: https://img.shields.io/badge/Marketplace-blue.svg?colorA=24292e&colorB=0366d6&style=flat&longCache=true&logo=github
[marketplace]: https://github.com/marketplace/actions/notify-to-feishu

# Notify to Feishu [![Notify to Feishu][badge-svg]][marketplace]

<div align="right">
  <a href="../README.md">
    English
  </a>
  <span>  •  中文<span>
</div>
<br/>

一款 GitHub Action，可自动将 GitHub 事件（如 PR、Issue、评论等）通知到飞书（Feishu）群聊中。

## 功能特点

- 支持监听多种 GitHub 事件类型：
  - Pull Request（创建、关闭、重新打开、就绪审核、请求审核、更新）
  - Issue（创建、关闭、重新打开）
  - Issue 评论（创建）
- 配置简单，仅需提供飞书机器人 Webhook 地址即可使用

## 前置准备

1. 在飞书群聊中创建「自定义机器人」并获取 Webhook 地址：

   - 打开飞书群聊 → 点击右上角「设置」→「群机器人」→「添加机器人」→「自定义机器人」
   - 复制机器人的 Webhook 地址（格式示例：`https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxx`）

2. 在 GitHub 仓库中将飞书 Webhook 存储为 Secrets：
   - 进入仓库 → 点击「Settings」→「Secrets and variables」→「Actions」→「New repository secret」
   - 名称填写 `FEISHU_WEBHOOK`，值粘贴飞书机器人的 Webhook 地址 → 点击「Save」

## 使用方法

在你的 GitHub 仓库中创建工作流文件（例如 `.github/workflows/feishu-notify.yml`），并添加以下内容：

```yaml
name: Feishu Notification
on:
  # 监听的事件列表（可根据需求调整）
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
  issues:
    types: [opened, closed, reopened]
  issue_comment:
    types: [created]
  release:
    types: [published]

jobs:
  notify:
    runs-on: ubuntu-latest
    # 过滤草稿状态的 PR 和 release
    if: |
      !(
        (github.event_name == 'pull_request' && github.event.pull_request.draft) ||
        (github.event_name == 'release' && github.event.release.draft)
      )
    steps:
      - name: 发送通知到飞书
        uses: leo-191/feishu-notify@v1
        with:
          # 引用仓库中存储的飞书 Webhook 密钥
          feishu_webhook: ${{ secrets.FEISHU_WEBHOOK }}
```

## 配置参数

| 参数名         | 是否必选 | 描述                    | 示例值                                                |
| -------------- | -------- | ----------------------- | ----------------------------------------------------- |
| feishu_webhook | 是       | 飞书机器人 Webhook 地址 | `https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxx` |

## 开源许可

本项目基于 MIT 许可证 开源，可自由使用和修改。

## 反馈与贡献

若遇到问题或有功能需求，欢迎提交 Issue 反馈，或通过 Pull Request 参与贡献。
