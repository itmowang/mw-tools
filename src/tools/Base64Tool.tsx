import { Card, Input, Radio, Space, Typography } from "antd";
import { useMemo, useState } from "react";

function toBase64Unicode(str: string) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return btoa(binary);
}

function fromBase64Unicode(b64: string) {
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch (e: any) {
    return "";
  }
}

export const Base64Tool = () => {
  const [mode, setMode] = useState<"encode"|"decode">("encode");
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    if (!input) return "";
    return mode === "encode" ? toBase64Unicode(input) : fromBase64Unicode(input);
  }, [mode, input]);

  return (
    <Card title="Base64 编解码" className="hover-scale">
      <Space direction="vertical" className="w-full">
        <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
          <Radio.Button value="encode">编码</Radio.Button>
          <Radio.Button value="decode">解码</Radio.Button>
        </Radio.Group>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography.Text type="secondary">输入</Typography.Text>
            <Input.TextArea rows={8} value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <Typography.Text type="secondary">输出</Typography.Text>
            <Input.TextArea rows={8} value={output} readOnly />
          </div>
        </div>
      </Space>
    </Card>
  );
};
