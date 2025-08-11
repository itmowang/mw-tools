import { Card, Input, Radio, Space, Typography, Alert } from "antd";
import { useMemo, useState } from "react";

export const UrlTool = () => {
  const [mode, setMode] = useState<"encode"|"decode">("encode");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string>("");

  const output = useMemo(() => {
    setError("");
    if (!input) return "";
    try {
      return mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
    } catch (e: any) {
      setError(e.message || "解析失败");
      return "";
    }
  }, [mode, input]);

  return (
    <Card title="URL 编解码" className="hover-scale">
      <Space direction="vertical" className="w-full">
        <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
          <Radio.Button value="encode">编码</Radio.Button>
          <Radio.Button value="decode">解码</Radio.Button>
        </Radio.Group>
        {error && <Alert type="error" message={error} />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography.Text type="secondary">输入</Typography.Text>
            <Input.TextArea rows={6} value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <Typography.Text type="secondary">输出</Typography.Text>
            <Input.TextArea rows={6} value={output} readOnly />
          </div>
        </div>
      </Space>
    </Card>
  );
};
