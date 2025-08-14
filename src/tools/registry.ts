export type ToolId =
  | "calculator"
  | "text"
  | "json"
  | "image"
  | "qrcode"
  | "qrcode-batch"
  | "base64"
  | "url"
  | "password"
  | "md5"
  | "jwt"
  | "timestamp"
  | "svg"
  | "css-gradient"
  | "yaml-properties"
  | "cron"
  | "regex"
  | "http"
  | "html-markdown"
  | "color"
  | "mortgage"
  | "bmi"
  | "hls"
  | "mp4"
  | "mpegts"
  | "flv"
  | "websocket"
  | "social-insurance"
  | "cholesterol-ai";



export const toolMeta: Record<ToolId, { title: string; description: string; path: string }> = {
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
  svg: { title: "SVG 编辑器", description: "在线编辑/预览 SVG 代码，支持上传与下载。", path: "/svg" },
  "css-gradient": { title: "CSS 渐变生成器", description: "可视化生成 linear-gradient 代码。", path: "/css-gradient" },
  "yaml-properties": { title: "YAML 与 Properties 互转", description: "在 YAML 与 .properties 之间相互转换。", path: "/yaml-properties" },
  cron: { title: "Cron 表达式生成器", description: "交互式选择，快速生成 Cron 表达式。", path: "/cron" },
  regex: { title: "正则表达式工具", description: "测试正则，查看高亮匹配与分组。", path: "/regex" },
  http: { title: "HTTP 请求测试", description: "构造请求、查看响应状态/头/体。", path: "/http" },
  "html-markdown": { title: "HTML 与 Markdown 互转", description: "MD→HTML 与 HTML→MD，双向预览。", path: "/html-markdown" },
  color: { title: "颜色工具", description: "取色、格式转换、调色板生成。", path: "/color" },
  mortgage: { title: "房贷利率调整计算器", description: "比较利率调整前后的月供与总利息。", path: "/mortgage" },
  bmi: { title: "BMI 计算", description: "输入身高体重，计算 BMI 与体重分类。", path: "/bmi" },
  "social-insurance": { title: "五险一金计算", description: "根据基数与比例，估算个人与单位缴费。", path: "/social-insurance" },
  hls: { title: "HLS 在线播放", description: "粘贴 m3u8 地址测试播放，显示详细错误。", path: "/hls" },
  mp4: { title: "MP4 在线播放", description: "粘贴 mp4 地址测试播放，显示详细错误。", path: "/mp4" },
  mpegts: { title: "MPEG-TS 在线播放", description: "粘贴 .ts/mpeg 地址测试播放，显示详细错误。", path: "/mpegts" },
  flv: { title: "FLV 在线播放", description: "粘贴 flv 地址测试播放，显示详细错误。", path: "/flv" },
  websocket: { title: "WebSocket 在线测试", description: "连接服务器发送/接收消息，详细错误与日志。", path: "/websocket" },
  "cholesterol-ai": { title: "胆固醇食物建议", description: "AI智能分析食物胆固醇含量，提供个性化饮食建议。", path: "/cholesterol-ai" },
};
