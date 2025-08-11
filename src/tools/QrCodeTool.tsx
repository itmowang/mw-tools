import { Card, Input, Space, Select, Button } from "antd";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";

export const QrCodeTool = () => {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(256);
  const [dataUrl, setDataUrl] = useState<string>("");

  const options = useMemo(() => ({ width: size, margin: 2 }), [size]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const url = await QRCode.toDataURL(text || " ", options);
        if (active) setDataUrl(url);
      } catch {
        if (active) setDataUrl("");
      }
    })();
    return () => { active = false; };
  }, [text, options]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
  };

  return (
    <Card title="二维码生成" className="hover-scale">
      <Space direction="vertical" className="w-full">
        <Input placeholder="输入文本或链接" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex items-center gap-3">
          尺寸
          <Select
            value={size}
            onChange={setSize}
            options={[128, 192, 256, 320, 384].map((v) => ({ label: `${v}px`, value: v }))}
            style={{ width: 140 }}
          />
          <Button type="primary" disabled={!dataUrl} onClick={handleDownload}>下载PNG</Button>
        </div>
        <div className="flex justify-center py-4">
          {dataUrl && <img src={dataUrl} alt="二维码" width={size} height={size} />}
        </div>
      </Space>
    </Card>
  );
};
