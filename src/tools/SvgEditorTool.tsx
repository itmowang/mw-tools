import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const SvgEditorTool = () => {
  const [code, setCode] = useState<string>(
    `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">\n  <defs>\n    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">\n      <stop offset="0%" stop-color="#6366f1"/>\n      <stop offset="100%" stop-color="#22d3ee"/>\n    </linearGradient>\n  </defs>\n  <rect width="320" height="180" rx="16" fill="url(#g)" />\n  <circle cx="100" cy="90" r="40" fill="#fff" opacity="0.2"/>\n  <text x="160" y="98" text-anchor="middle" fill="#fff" font-size="18" font-family="sans-serif">Hello SVG</text>\n</svg>`
  );
  const [error, setError] = useState<string>("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setError("");
    try {
      // basic validation by parsing as DOM
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, "image/svg+xml");
      const parserError = doc.getElementsByTagName("parsererror")[0];
      if (parserError) setError(parserError.textContent || "SVG 解析错误");
    } catch (e: any) {
      setError(e?.message || "SVG 解析错误");
    }
  }, [code]);

  const download = () => {
    const blob = new Blob([code], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "image.svg";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const loadFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setCode(String(reader.result || ""));
    reader.readAsText(f);
  };

  const preview = useMemo(() => ({ __html: code }), [code]);

  return (
    <div className="grid gap-4 md:grid-cols-2 animate-enter">
      <Card>
        <CardHeader>
          <CardTitle>SVG 代码</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Input type="file" accept=".svg,image/svg+xml" onChange={(e) => e.target.files && loadFile(e.target.files[0])} />
            <Button variant="outline" onClick={download}>下载 SVG</Button>
          </div>
          <Textarea value={code} onChange={(e) => setCode(e.target.value)} rows={18} />
          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>实时预览</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={ref} className="rounded-lg border bg-muted/30 p-3 overflow-auto" style={{ minHeight: 300 }}>
            <div dangerouslySetInnerHTML={preview} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
