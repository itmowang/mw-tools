import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type HeaderRow = { key: string; value: string };

export const HttpRequestTool = () => {
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "PATCH" | "DELETE">("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [headers, setHeaders] = useState<HeaderRow[]>([{ key: "Accept", value: "application/json" }]);
  const [body, setBody] = useState("{
  \"title\": \"foo\",
  \"body\": \"bar\",
  \"userId\": 1
}");
  const [status, setStatus] = useState<string>("");
  const [respHeaders, setRespHeaders] = useState<string>("");
  const [respBody, setRespBody] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    try {
      setLoading(true);
      setStatus(""); setRespHeaders(""); setRespBody("");
      const init: RequestInit = { method };
      const h: Record<string, string> = {};
      headers.filter(h => h.key).forEach(({ key, value }) => (h[key] = value));
      if (Object.keys(h).length) init.headers = h;
      if (method !== "GET" && body) init.body = body;
      const t0 = performance.now();
      const res = await fetch(url, init);
      const t1 = performance.now();
      setStatus(`${res.status} ${res.statusText} (${Math.round(t1 - t0)}ms)`);
      let headerStr = "";
      res.headers.forEach((v, k) => (headerStr += `${k}: ${v}\n`));
      setRespHeaders(headerStr.trim());
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const json = await res.json();
        setRespBody(JSON.stringify(json, null, 2));
      } else {
        const text = await res.text();
        setRespBody(text);
      }
    } catch (e: any) {
      toast.error(e?.message || "请求失败（可能被 CORS 限制）");
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => setHeaders((rows) => [...rows, { key: "", value: "" }]);

  const curl = useMemo(() => {
    const parts = ["curl", `-X ${method}`, `'${url}'`];
    headers.filter((r) => r.key).forEach((r) => parts.push(`-H '${r.key}: ${r.value}'`));
    if (method !== "GET" && body) parts.push(`--data '${body.replace(/'/g, "'\\''")}'`);
    return parts.join(" ");
  }, [method, url, headers, body]);

  return (
    <div className="space-y-4 animate-enter">
      <Card>
        <CardHeader>
          <CardTitle>请求配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-6">
            <select className="border rounded px-2 py-1 bg-background" value={method} onChange={(e) => setMethod(e.target.value as any)}>
              {(["GET","POST","PUT","PATCH","DELETE"] as const).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="md:col-span-5"><Input placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">请求头</span>
              <Button size="sm" variant="secondary" onClick={addRow}>新增</Button>
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr auto" }}>
              {headers.map((row, i) => (
                <div key={i} className="contents">
                  <Input placeholder="Header" value={row.key} onChange={(e) => setHeaders((rs) => rs.map((r, idx) => idx===i?{...r, key:e.target.value}:r))} />
                  <Input placeholder="Value" value={row.value} onChange={(e) => setHeaders((rs) => rs.map((r, idx) => idx===i?{...r, value:e.target.value}:r))} />
                  <Button variant="ghost" onClick={() => setHeaders((rs) => rs.filter((_, idx) => idx!==i))}>删除</Button>
                </div>
              ))}
            </div>
          </div>
          {method !== "GET" && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">请求体</span>
              <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={send} disabled={loading}>{loading?"发送中...":"发送请求"}</Button>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(curl)}>复制 cURL</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>响应</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input readOnly value={status} placeholder="状态" className="md:col-span-3" />
          <Textarea readOnly value={respHeaders} rows={8} className="md:col-span-1" />
          <Textarea readOnly value={respBody} rows={8} className="md:col-span-2" />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">提示：浏览器环境受 CORS 限制，请确保目标接口允许跨域访问。</p>
    </div>
  );
};
