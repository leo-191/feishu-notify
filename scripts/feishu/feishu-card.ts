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
  default?: "small" | "medium" | "large" | "extra_large"; // 旧版客户端兜底
  pc: "small" | "medium" | "large" | "extra_large"; // 桌面端
  mobile: "small" | "medium" | "large" | "extra_large"; // 移动端
}

/** 自定义颜色配置 */
export interface CustomColorItem {
  light_mode: string; // 浅色主题 RGBA（如 "rgba(5,157,178,0.52)"）
  dark_mode: string; // 深色主题 RGBA（如 "rgba(78,23,108,0.49)"）
}

/** 文本基础结构 */
export interface BaseText {
  tag: "plain_text" | "lark_md"; // 文本类型
  content: string; // 文本内容
  i18n_content?: I18nText; // 多语言配置
}

/** 流式更新配置（streaming_config 子字段） */
export interface StreamingConfig {
  print_frequency_ms?: {
    default: number; // 默认端刷新频率（ms）
    android?: number; // Android 端
    ios?: number; // iOS 端
    pc?: number; // PC 端
  };
  print_step?: {
    default: number; // 默认端步长（字符数）
    android?: number; // Android 端
    ios?: number; // iOS 端
    pc?: number; // PC 端
  };
  print_strategy?: "fast" | "delay"; // 流式策略
}

/** 摘要配置（summary 子字段） */
export interface SummaryConfig {
  content: string; // 摘要文本（流式更新默认 "生成中"）
  i18n_content?: I18nText; // 摘要多语言
}

/** 全局样式配置（style 子字段） */
export interface CardStyle {
  text_size?: Record<string, CustomTextSizeItem>; // 自定义字号集合（key 如 "cus-0"）
  color?: Record<string, CustomColorItem>; // 自定义颜色集合（key 如 "cus-0"）
}

/** 卡片全局行为配置（config 字段） */
export interface CardConfig {
  streaming_mode?: boolean; // 是否流式更新，默认 false
  streaming_config?: StreamingConfig; // 流式更新配置，仅 streaming_mode=true 时生效
  summary?: SummaryConfig; // 聊天栏预览摘要
  locales?: (keyof I18nText)[]; // 生效语言列表（如 ["en_us", "ja_jp"]）
  enable_forward?: boolean; // 是否允许转发，默认 true
  update_multi?: true; // 是否共享卡片，2.0 仅支持 true（默认 true）
  width_mode?: "default" | "compact" | "fill"; // 宽度模式，默认 "default"
  use_custom_translation?: boolean; // 是否用自定义翻译，默认 false
  enable_forward_interaction?: boolean; // 转发卡片是否支持交互，默认 false
  style?: CardStyle; // 全局自定义样式
}

/** 卡片全局跳转链接（card_link 字段） */
export interface CardLink {
  url?: string; // 默认链接（与端链接二选一：要么填 url，要么填全部端链接）
  android_url?: string; // Android 端链接
  ios_url?: string; // iOS 端链接
  pc_url?: string; // PC 端链接
  // 约束：禁止某端跳转可设为 "lark://msgcard/unsupported_action"
}

/** 标题后缀标签（text_tag_list 子项） */
export interface TextTag {
  tag: "text_tag"; // 标签类型
  element_id: string; // 唯一标识（字母开头，字母/数字/下划线，≤20字符）
  text: BaseText; // 标签文本
  color: "neutral" | "blue" | "green" | "orange" | "red"; // 标签颜色
}

/** 头部图标配置（icon 子字段） */
export interface HeaderIcon {
  tag: "standard_icon" | "custom_icon"; // 图标类型
  token?: string; // 标准图标标识，仅 tag=standard_icon 时必填（如 "chat-forbidden_outlined"）
  color?: string; // 标准图标颜色，仅 tag=standard_icon 时可选
  img_key?: string; // 自定义图标 key，仅 tag=custom_icon 时必填（如 "img_v2_38811724"）
}

/** 卡片头部（header 字段） */
export interface CardHeader {
  title: BaseText; // 主标题
  subtitle?: BaseText; // 副标题
  text_tag_list?: TextTag[]; // 标题后缀标签（最多 3 个）
  i18n_text_tag_list?: Record<keyof I18nText, TextTag[]>; // 标签多语言（每语种最多 3 个）
  template?:
    | "blue"
    | "wathet"
    | "turquoise"
    | "green"
    | "yellow"
    | "orange"
    | "red"
    | "carmine"
    | "violet"
    | "purple"
    | "indigo"
    | "grey"
    | "default"; // 头部主题色，默认 "default"
  icon?: HeaderIcon; // 头部前缀图标
  padding?: string; // 内边距（如 "12px 8px"），默认 "12px"（范围 0-99px）
}

/** 卡片组件基础结构（body.elements 子项通用） */
export interface BaseCardElement {
  tag: string; // 组件类型标识（如 "div"、"button"、"image"）
  element_id?: string; // 组件唯一标识（字母开头，字母/数字/下划线，≤20字符）（流式更新需填）
  [key: string]: any;
}

/** 卡片正文（body 字段） */
export interface CardBody {
  direction?: "vertical" | "horizontal"; // 组件排列方向，默认 "vertical"
  padding?: string; // 内边距（如 "12px 8px"）（范围 0-99px）
  horizontal_spacing?: "small" | "medium" | "large" | "extra_large" | string; // 水平间距（如 "3px"，范围 0-99px）
  horizontal_align?: "left" | "center" | "right"; // 水平对齐，默认 "left"
  vertical_spacing?: "small" | "medium" | "large" | "extra_large" | string; // 垂直间距（如 "4px"，范围 0-99px）
  vertical_align?: "top" | "center" | "bottom"; // 垂直对齐，默认 "top"
  elements: BaseCardElement[]; // 组件数组（最多 200 个元素）
}

/** 飞书卡片 JSON 2.0 主结构 */
export interface FeishuCard {
  schema: "2.0"; // 版本声明（2.0 必须显式声明）
  config?: CardConfig; // 全局行为配置
  card_link?: CardLink; // 全局跳转链接（url 与端链接二选一）
  header?: CardHeader; // 卡片头部
  body?: CardBody; // 卡片正文（空卡片可仅传 schema）
}
