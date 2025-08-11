import React, { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const HlsPlayerTool: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [inputUrl, setInputUrl] = useState("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8");
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const canNativeHls = useMemo(() => {
    const v = document.createElement("video");
    return v.canPlayType("application/vnd.apple.mpegurl") !== "";
  }, []);

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!url || !videoRef.current) return;
    setError("");

    const video = videoRef.current;

    async function setup() {
      setLoading(true);
      try {
        if (Hls.isSupported()) {
          if (hlsRef.current) hlsRef.current.destroy();
          const hls = new Hls({ enableWorker: true });
          hlsRef.current = hls;
          hls.attachMedia(video);
          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            hls.loadSource(url);
          });
          hls.on(Hls.Events.ERROR, (_, data) => {
            const { type, details, fatal } = data;
            const msg = `HLS 播放错误：${type} - ${details || "未知细节"}${fatal ? "（致命）" : ""}`;
            setError(msg);
            if (fatal) {
              try { hls.destroy(); } catch {}
            }
          });
        } else if (canNativeHls) {
          video.src = url;
          video.load();
        } else {
          setError("当前浏览器不支持 HLS（m3u8），请使用 Chrome/Edge+Hls.js 或 Safari。");
        }

        // auto play when metadata ready
        const onCanPlay = () => {
          video.play().catch((e) => {
            setError(`自动播放失败：${String(e)}`);
          });
        };
        video.addEventListener("canplay", onCanPlay);

        const onVideoError = () => {
          const mediaError = video.error;
          let codeMsg = "";
          if (mediaError) {
            const map: Record<number, string> = {
              1: "用户终止",
              2: "网络错误",
              3: "解码错误",
              4: "不支持的资源/格式",
            };
            codeMsg = map[(mediaError as any).code] || "未知错误";
          }
          setError(`视频元素错误：${codeMsg}`);
        };
        video.addEventListener("error", onVideoError);

        return () => {
          video.removeEventListener("canplay", onCanPlay);
          video.removeEventListener("error", onVideoError);
        };
      } finally {
        setLoading(false);
      }
    }

    const cleanup = setup();
    return () => {
      if (hlsRef.current) {
        try { hlsRef.current.destroy(); } catch {}
        hlsRef.current = null;
      }
      if (video) {
        video.removeAttribute("src");
        video.load();
      }
      if (typeof cleanup === "function") (cleanup as any)();
    };
  }, [url, canNativeHls]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>HLS 在线播放测试（m3u8）</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="粘贴 m3u8 地址"
          />
          <Button onClick={() => setUrl(inputUrl)} disabled={loading}>
            加载并播放
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>播放失败</AlertTitle>
            <AlertDescription>
              {error}
              <br />
              可能原因：跨域（CORS）限制、地址无效、格式不兼容、服务器不支持 Range。
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

export default HlsPlayerTool;
