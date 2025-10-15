"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeishuBotClient = void 0;
const axios_1 = __importDefault(require("axios"));
class FeishuBotClient {
    constructor(webhookUrl) {
        if (!webhookUrl) {
            throw new Error("飞书机器人 Webhook 地址不能为空");
        }
        this.webhookUrl = webhookUrl;
    }
    async sendCard(payload) {
        try {
            const response = await axios_1.default.post(this.webhookUrl, payload);
            if (response.data.code !== 0) {
                console.error("飞书消息发送失败: ", response.data);
                throw new Error(`飞书 API 返回错误: ${response.data.msg}`);
            }
            console.log("飞书消息发送成功:\n", JSON.stringify(payload));
        }
        catch (error) {
            console.error("发送飞书消息时发生错误: ", error);
            throw error;
        }
    }
}
exports.FeishuBotClient = FeishuBotClient;
//# sourceMappingURL=client.js.map