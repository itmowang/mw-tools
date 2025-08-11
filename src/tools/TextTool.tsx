import { Card, Input, Typography, Space, Statistic } from "antd";
import { useMemo, useState } from "react";

export const TextTool = () => {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const len = text.length;
    const words = (text.trim().match(/\S+/g) || []).length;
    const lines = text.split(/\n/).length;
    return { len, words, lines };
  }, [text]);

  const upper = text.toUpperCase();
  const lower = text.toLowerCase();
  const slug = text.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

  return (
    <Card title="文本处理" className="hover-scale">
      <Space direction="vertical" className="w-full">
        <Input.TextArea rows={6} placeholder="粘贴或输入文本..." value={text} onChange={(e) => setText(e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card size="small" title="统计"><Space><Statistic title="字符" value={stats.len} /><Statistic title="单词" value={stats.words} /><Statistic title="行数" value={stats.lines} /></Space></Card>
          <Card size="small" title="大写"><Typography.Paragraph copyable className="break-all">{upper}</Typography.Paragraph></Card>
          <Card size="small" title="小写"><Typography.Paragraph copyable className="break-all">{lower}</Typography.Paragraph></Card>
          <Card size="small" title="Slug"><Typography.Paragraph copyable className="break-all">{slug}</Typography.Paragraph></Card>
        </div>
      </Space>
    </Card>
  );
};
