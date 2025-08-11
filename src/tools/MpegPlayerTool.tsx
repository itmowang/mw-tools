import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// 动态加载 mpegts.js（CDN）
function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existed = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existed) {
      if ((existed as any)._loaded) return resolve();
      existed.addEventListener("load", () => resolve());
      existed.addEventListener("error", () => reject(new Error("加载脚本失败")));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    (s as any)._loaded = false;
    s.onload = () => {
      (s as any)._loaded = true;
      resolve();
    };
    s.onerror = () => reject(new Error("加载脚本失败"));
    document.body.appendChild(s);
  });
}

declare global {
  interface Window { mpegts?: any }
}

export const MpegPlayerTool: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  const [inputUrl, setInputUrl] = useState("https://example.com/stream.ts");
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    (async () => {
      if (!url || !videoRef.current) return;
      setError("");

      try {
        await loadScript("https://cdn.jsdelivr.net/npm/mpegts.js@1.7.3/dist/mpegts.min.js");
      } catch {
        if (!disposed) setError("加载 mpegts.js 失败，请检查网络或换用其他源。");
        return;
      }

      const mpegts = window.mpegts;
      if (!mpegts || !mpegts.isSupported()) {
        if (!disposed) setError("当前浏览器不支持 MPEG-TS 播放，请使用现代浏览器（需支持 MSE）。");
        return;
      }

      const player = mpegts.createPlayer({ type: "mpegts", url });
      playerRef.current = player;
      player.attachMediaElement(videoRef.current);
      player.load();
      const _p: any = player.play?.();
      if (_p && typeof _p.catch === "function") {
        _p.catch((e: any) => !disposed && setError(`自动播放失败：${String(e)}`));
      }

      player.on(mpegts.Events.ERROR, (type: any, detail: any) => {
        if (!disposed) setError(`MPEG-TS 播放错误：${type} - ${JSON.stringify(detail)}`);
      });
    })();

    return () => {
      disposed = true;
      try { playerRef.current?.destroy?.(); } catch {}
      playerRef.current = null;
    };
  }, [url]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>MPEG-TS 在线播放测试</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="粘贴 .ts 或 mpeg 地址" />
          <Button onClick={() => setUrl(inputUrl)}>加载并播放</Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>播放失败</AlertTitle>
            <AlertDescription>
              {error}
              <br />可能原因：跨域（CORS）限制、地址无效、编码不兼容、服务器不支持。
            </AlertDescription>
          </Alert>
        )}

        <div className="aspect-video bg-muted rounded-md overflow-hidden">
          <video ref={videoRef} controls className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default MpegPlayerTool;
