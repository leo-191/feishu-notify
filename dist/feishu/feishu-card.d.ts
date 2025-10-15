/**
 * 飞书卡片 JSON 2.0 结构 TypeScript 接口定义
 * 参考文档：https://open.feishu.cn/document/feishu-cards/card-json-v2-structure
 * 适配飞书客户端 7.20+ 版本，包含所有官方声明的字段和约束
 */
/** 多语言文本映射 */
export interface I18nText {
    zh_cn?: string;
    en_us?: string;
    ja_jp?: string;
    zh_hk?: string;
    zh_tw?: string;
}
/** 自定义字号配置 */
export interface CustomTextSizeItem {
    default?: "small" | "medium" | "large" | "extra_large";
    pc: "small" | "medium" | "large" | "extra_large";
    mobile: "small" | "medium" | "large" | "extra_large";
}
/** 自定义颜色配置 */
export interface CustomColorItem {
    light_mode: string;
    dark_mode: string;
}
/** 文本基础结构 */
export interface BaseText {
    tag: "plain_text" | "lark_md";
    content: string;
    i18n_content?: I18nText;
}
/** 流式更新配置（streaming_config 子字段） */
export interface StreamingConfig {
    print_frequency_ms?: {
        default: number;
        android?: number;
        ios?: number;
        pc?: number;
    };
    print_step?: {
        default: number;
        android?: number;
        ios?: number;
        pc?: number;
    };
    print_strategy?: "fast" | "delay";
}
/** 摘要配置（summary 子字段） */
export interface SummaryConfig {
    content: string;
    i18n_content?: I18nText;
}
/** 全局样式配置（style 子字段） */
export interface CardStyle {
    text_size?: Record<string, CustomTextSizeItem>;
    color?: Record<string, CustomColorItem>;
}
/** 卡片全局行为配置（config 字段） */
export interface CardConfig {
    streaming_mode?: boolean;
    streaming_config?: StreamingConfig;
    summary?: SummaryConfig;
    locales?: (keyof I18nText)[];
    enable_forward?: boolean;
    update_multi?: true;
    width_mode?: "default" | "compact" | "fill";
    use_custom_translation?: boolean;
    enable_forward_interaction?: boolean;
    style?: CardStyle;
}
/** 卡片全局跳转链接（card_link 字段） */
export interface CardLink {
    url?: string;
    android_url?: string;
    ios_url?: string;
    pc_url?: string;
}
/** 标题后缀标签（text_tag_list 子项） */
export interface TextTag {
    tag: "text_tag";
    element_id: string;
    text: BaseText;
    color: "neutral" | "blue" | "green" | "orange" | "red";
}
/** 头部图标配置（icon 子字段） */
export interface HeaderIcon {
    tag: "standard_icon" | "custom_icon";
    token?: string;
    color?: string;
    img_key?: string;
}
/** 卡片头部（header 字段） */
export interface CardHeader {
    title: BaseText;
    subtitle?: BaseText;
    text_tag_list?: TextTag[];
    i18n_text_tag_list?: Record<keyof I18nText, TextTag[]>;
    template?: "blue" | "wathet" | "turquoise" | "green" | "yellow" | "orange" | "red" | "carmine" | "violet" | "purple" | "indigo" | "grey" | "default";
    icon?: HeaderIcon;
    padding?: string;
}
/** 卡片组件基础结构（body.elements 子项通用） */
export interface BaseCardElement {
    tag: string;
    element_id?: string;
    [key: string]: any;
}
/** 卡片正文（body 字段） */
export interface CardBody {
    direction?: "vertical" | "horizontal";
    padding?: string;
    horizontal_spacing?: "small" | "medium" | "large" | "extra_large" | string;
    horizontal_align?: "left" | "center" | "right";
    vertical_spacing?: "small" | "medium" | "large" | "extra_large" | string;
    vertical_align?: "top" | "center" | "bottom";
    elements: BaseCardElement[];
}
/** 飞书卡片 JSON 2.0 主结构 */
export interface FeishuCard {
    schema: "2.0";
    config?: CardConfig;
    card_link?: CardLink;
    header?: CardHeader;
    body?: CardBody;
}
//# sourceMappingURL=feishu-card.d.ts.map