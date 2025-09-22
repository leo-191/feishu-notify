import axios from "axios";
import { FeishuWebhookPayload } from "./types";

export class FeishuBotClient {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    if (!webhookUrl) {
      throw new Error("飞书机器人 Webhook 地址不能为空");
    }
    this.webhookUrl = webhookUrl;
  }

  async sendCard(payload: FeishuWebhookPayload): Promise<void> {
    try {
      const response = await axios.post(this.webhookUrl, payload);

      if (response.data.code !== 0) {
        console.error("飞书消息发送失败: ", response.data);
        throw new Error(`飞书 API 返回错误: ${response.data.msg}`);
      }

      console.log("飞书消息发送成功");
    } catch (error) {
      console.error("发送飞书消息时发生错误: ", error);
      throw error;
    }
  }
}
