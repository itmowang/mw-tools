export type ToolId = "calculator" | "text" | "json" | "image" |
  "qrcode" | "qrcode-batch" | "base64" | "url" | "password" | "md5" | "jwt" | "timestamp";

export const toolMeta: Record<ToolId, { title: string; description: string; path: string } > = {
  calculator: { title: "计算器", description: "输入表达式，立即得到结果。", path: "/calculator" },
  text: { title: "文本处理", description: "大小写转换、字数统计、去空格等。", path: "/text" },
  json: { title: "JSON 格式化", description: "格式化 / 压缩 JSON，校验语法。", path: "/json" },
  image: { title: "图像编辑", description: "本地图像灰度/亮度调整与下载。", path: "/image" },
  qrcode: { title: "二维码生成", description: "输入文本/链接，实时生成二维码。", path: "/qrcode" },
  "qrcode-batch": { title: "二维码批量生成", description: "多条内容批量生成二维码，支持下载。", path: "/qrcode-batch" },
  base64: { title: "Base64 编解码", description: "快速进行 Base64 编码与解码。", path: "/base64" },
  url: { title: "URL 编解码", description: "URL 编码与解码，避免参数乱码。", path: "/url" },
  password: { title: "随机密码生成", description: "按规则生成强密码。", path: "/password" },
  md5: { title: "MD5 在线加密", description: "对文本进行 MD5 摘要计算。", path: "/md5" },
  jwt: { title: "JWT 解析工具", description: "解析 JWT 头部与载荷（不验证签名）。", path: "/jwt" },
  timestamp: { title: "时间戳转换", description: "Unix 时间戳与日期时间互转（本地/UTC）。", path: "/timestamp" },
};
