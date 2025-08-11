import { Card, Input, Space, Typography, Alert } from "antd";
import { useMemo, useState } from "react";

function base64UrlToBase64(input: string) {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4;
  if (pad) input += "=".repeat(4 - pad);
  return input;
}

function decodePart(part: string) {
  try {
    const b64 = base64UrlToBase64(part);
    const json = new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0)));
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch (e: any) {
    return "";
  }
}

export const JwtTool = () => {
  const [jwt, setJwt] = useState("");
  const [header, payload, signature, error] = useMemo(() => {
    if (!jwt.trim()) return ["", "", "", ""] as const;
    const parts = jwt.split(".");
    if (parts.length !== 3) return ["", "", "", "JWT 结构不正确，应为三段"] as const;
    const [h, p, s] = parts;
    const hd = decodePart(h);
    const pl = decodePart(p);
    return [hd, pl, s, ""] as const;
  }, [jwt]);

  return (
    <Card title="JWT 解析工具" className="hover-scale">
      <Space direction="vertical" className="w-full">
        {error && <Alert type="error" message={error} />}
        <Input.TextArea rows={4} placeholder="粘贴 JWT 字符串（不验证签名）" value={jwt} onChange={(e) => setJwt(e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography.Text type="secondary">Header</Typography.Text>
            <Input.TextArea rows={8} value={header} readOnly />
          </div>
          <div>
            <Typography.Text type="secondary">Payload</Typography.Text>
            <Input.TextArea rows={8} value={payload} readOnly />
          </div>
        </div>
        <div>
          <Typography.Text type="secondary">Signature（Base64URL）</Typography.Text>
          <Input value={signature} readOnly />
        </div>
      </Space>
    </Card>
  );
};
