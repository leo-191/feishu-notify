import { FeishuWebhookPayload } from "./types";
export declare class FeishuBotClient {
    private webhookUrl;
    constructor(webhookUrl: string);
    sendCard(payload: FeishuWebhookPayload): Promise<void>;
}
//# sourceMappingURL=client.d.ts.map