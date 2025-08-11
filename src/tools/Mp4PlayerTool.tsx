import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function mapMediaError(video: HTMLVideoElement | null) {
  const err = video?.error as any;
  if (!err) return "未知错误";
  const map: Record<number, string> = {
    1: "用户终止",
    2: "网络错误",
    3: "解码错误",
    4: "不支持的资源/格式",
  };
  return map[err.code] || `未知错误(${err.code})`;
}

export const Mp4PlayerTool: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inputUrl, setInputUrl] = useState("https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4");
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const onLoad = () => {
    setError("");
    setUrl(inputUrl);
    const v = videoRef.current;
    if (v) {
      v.src = inputUrl;
      v.load();
      v.play().catch((e) => setError(`自动播放失败：${String(e)}`));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>MP4 在线播放测试</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="粘贴 mp4 地址" />
          <Button onClick={onLoad}>加载并播放</Button>
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
          <video
            ref={videoRef}
            controls
            className="w-full h-full"
            onError={() => setError(`视频元素错误：${mapMediaError(videoRef.current)}`)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Mp4PlayerTool;
