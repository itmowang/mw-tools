import { Card, Space, Alert, Typography, Button } from "antd";
import { useMemo, useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";

export const JsonFormatterTool = () => {
  const [raw, setRaw] = useState("");
  const [indent, setIndent] = useState(2);

  const parsed = useMemo(() => {
    if (!raw.trim()) return { ok: true, pretty: "", error: "" };
    try {
      const obj = JSON.parse(raw);
      return { ok: true, pretty: JSON.stringify(obj, null, indent), error: "" };
    } catch (e: any) {
      return { ok: false, pretty: "", error: e.message };
    }
  }, [raw, indent]);

  return (
    <Card title="JSON 格式化" className="hover-scale">
      <Space direction="vertical" className="w-full">
        <CodeEditor language="json" value={raw} onChange={setRaw} minHeight={200} />
        <div className="flex items-center gap-3">
          <input type="number" min={0} max={8} value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="w-28 border rounded px-2 py-1 bg-background" />
          <Button onClick={() => setRaw(parsed.pretty)} disabled={!parsed.ok || !parsed.pretty}>替换为格式化结果</Button>
        </div>
        {parsed.ok ? (
          parsed.pretty ? (
            <>
              <Alert type="success" message="已校验：JSON 有效" showIcon />
              <Typography.Paragraph className="whitespace-pre-wrap break-all">
                <code className="text-sm block">{parsed.pretty}</code>
              </Typography.Paragraph>
            </>
          ) : null
        ) : (
          <Alert type="error" message="JSON 无效" description={parsed.error} showIcon />
        )}
      </Space>
    </Card>
  );
};
