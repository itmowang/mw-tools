import { Card, Input, Space, Select, List, Button } from "antd";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";

export const QrCodeBatchTool = () => {
  const [raw, setRaw] = useState("https://a.com\nhttps://b.com");
  const [size, setSize] = useState(192);
  const [codes, setCodes] = useState<{ text: string; url: string }[]>([]);

  const items = useMemo(() => raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean), [raw]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res: { text: string; url: string }[] = [];
      for (const t of items) {
        try {
          const url = await QRCode.toDataURL(t || " ", { width: size, margin: 1 });
          res.push({ text: t, url });
        } catch {
          res.push({ text: t, url: "" });
        }
      }
      if (!cancelled) setCodes(res);
    })();
    return () => { cancelled = true; };
  }, [items, size]);

  const dl = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url; a.download = `${name}.png`; a.click();
  };

  return (
    <Card title="二维码批量生成" className="hover-scale">
      <Space direction="vertical" className="w-full">
        <Input.TextArea rows={6} placeholder="每行一条内容" value={raw} onChange={(e) => setRaw(e.target.value)} />
        <div className="flex items-center gap-3">
          尺寸
          <Select value={size} onChange={setSize} options={[128, 160, 192, 256, 320].map(v => ({ label: `${v}px`, value: v }))} style={{ width: 140 }} />
        </div>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
          dataSource={codes}
          renderItem={(it) => (
            <List.Item>
              <Card size="small" className="text-center">
                {it.url ? <img src={it.url} alt="二维码" width={size} height={size} /> : <div className="text-muted-foreground">生成失败</div>}
                <div className="truncate mt-2" title={it.text}>{it.text}</div>
                {it.url && <Button className="mt-2" onClick={() => dl(it.url, it.text.slice(0,20) || "qrcode")}>下载</Button>}
              </Card>
            </List.Item>
          )}
        />
      </Space>
    </Card>
  );
};
