export type ToolId = "calculator" | "text" | "json" | "image";

export const toolMeta: Record<ToolId, { title: string; description: string; path: string } > = {
  calculator: { title: "计算器", description: "输入表达式，立即得到结果。", path: "/calculator" },
  text: { title: "文本处理", description: "大小写转换、字数统计、去空格等。", path: "/text" },
  json: { title: "JSON 格式化", description: "格式化 / 压缩 JSON，校验语法。", path: "/json" },
  image: { title: "图像编辑", description: "本地图像灰度/亮度调整与下载。", path: "/image" },
};
