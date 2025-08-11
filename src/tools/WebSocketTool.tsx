import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CodeEditor from "@/components/CodeEditor";

export const WebSocketTool: React.FC = () => {
  const [url, setUrl] = useState("wss://echo.websocket.events");
  const [connecting, setConnecting] = useState(false);
  const [open, setOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const [sendPayload, setSendPayload] = useState<string>("{\n  \"hello\": \"world\"\n}");
  const [log, setLog] = useState<{ type: "info" | "sent" | "recv" | "error"; text: string; time: string }[]>([]);

  const pushLog = (entry: { type: "info" | "sent" | "recv" | "error"; text: string }) => {
    const time = new Date().toLocaleTimeString();
    setLog((l) => [...l, { ...entry, time }]);
  };

  const canConnect = useMemo(() => !connecting && !open && url.trim().length > 0, [connecting, open, url]);

  const connect = () => {
    setConnecting(true);
    setLog([]);
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => {
        setConnecting(false);
        setOpen(true);
        pushLog({ type: "info", text: "已连接" });
      };
      ws.onmessage = (ev) => {
        pushLog({ type: "recv", text: typeof ev.data === "string" ? ev.data : "[Binary]" });
      };
      ws.onerror = (ev: any) => {
        pushLog({ type: "error", text: `错误：${ev?.message || "未知错误"}` });
      };
      ws.onclose = (ev) => {
        setOpen(false);
        setConnecting(false);
        pushLog({ type: "info", text: `连接关闭：code=${ev.code}, reason=${ev.reason || ""}` });
      };
    } catch (e) {
      setConnecting(false);
      pushLog({ type: "error", text: `创建连接失败：${String(e)}` });
    }
  };

  const disconnect = () => {
    try { wsRef.current?.close(); } catch {}
  };

  const send = () => {
    if (!open || !wsRef.current) return;
    let data: any = sendPayload;
    try {
      // try JSON first for convenience
      data = JSON.parse(sendPayload);
    } catch {}
    try {
      wsRef.current.send(typeof data === "string" ? data : JSON.stringify(data));
      pushLog({ type: "sent", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) });
    } catch (e) {
      pushLog({ type: "error", text: `发送失败：${String(e)}` });
    }
  };

  useEffect(() => {
    return () => {
      try { wsRef.current?.close(); } catch {}
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>WebSocket 在线测试</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="例如 wss://echo.websocket.events" />
          {!open ? (
            <Button onClick={connect} disabled={!canConnect}>
              {connecting ? "连接中..." : "连接"}
            </Button>
          ) : (
            <Button variant="destructive" onClick={disconnect}>断开</Button>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">消息内容（支持 JSON 自动识别）</div>
          <CodeEditor value={sendPayload} onChange={setSendPayload} language="json" minHeight={120} />
          <div className="flex gap-2">
            <Button onClick={send} disabled={!open}>发送</Button>
            <Button variant="secondary" onClick={() => setLog([])}>清空日志</Button>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">日志</div>
          <div className="h-64 overflow-auto rounded-md border p-3 text-sm" style={{ borderColor: "hsl(var(--border))" }}>
            {log.length === 0 && <div className="text-muted-foreground">暂无日志</div>}
            {log.map((l, i) => (
              <div key={i} className="mb-1">
                <span className="mr-2 text-muted-foreground">[{l.time}]</span>
                <span className={l.type === "error" ? "text-destructive" : l.type === "sent" ? "text-primary" : ""}>
                  {l.type.toUpperCase()}:
                </span>
                <pre className="whitespace-pre-wrap break-words inline ml-2">{l.text}</pre>
              </div>
            ))}
          </div>
          <Alert className="mt-3">
            <AlertTitle>提示</AlertTitle>
            <AlertDescription>
              如连接失败，常见原因包括：URL 无效、未使用 ws/wss 协议、服务器证书问题、跨域/反向代理限制、网络不可达等。
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebSocketTool;
