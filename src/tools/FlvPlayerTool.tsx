import React, { useEffect, useRef, useState } from "react";
// @ts-ignore - flv.js types may be missing
import flvjs from "flv.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const FlvPlayerTool: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const flvRef = useRef<any>(null);
  const [inputUrl, setInputUrl] = useState("https://example.com/demo.flv");
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    return () => {
      if (flvRef.current) {
        try { flvRef.current.destroy(); } catch {}
        flvRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!url || !videoRef.current) return;
    setError("");

    if (!flvjs || !flvjs.isSupported()) {
      setError("当前浏览器不支持 FLV 播放，请使用现代浏览器（需支持 MSE）。");
      return;
    }

    const player = flvjs.createPlayer({ type: "flv", url, isLive: false });
    flvRef.current = player;
    player.attachMediaElement(videoRef.current);
    player.load();
    const _p: any = (player as any).play?.();
    if (_p && typeof _p.catch === "function") {
      _p.catch((e: any) => setError(`自动播放失败：${String(e)}`));
    }

    player.on(flvjs.Events.ERROR, (type: any, detail: any) => {
      setError(`FLV 播放错误：${type} - ${JSON.stringify(detail)}`);
    });

    return () => {
      try { player.destroy(); } catch {}
    };
  }, [url]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>FLV 在线播放测试</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="粘贴 flv 地址" />
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

export default FlvPlayerTool;
