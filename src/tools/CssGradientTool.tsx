import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const CssGradientTool = () => {
  const [c1, setC1] = useState("#6366f1");
  const [c2, setC2] = useState("#22d3ee");
  const [angle, setAngle] = useState(135);

  const css = useMemo(() => `background: linear-gradient(${angle}deg, ${c1}, ${c2});`, [c1, c2, angle]);

  const copy = async () => {
    await navigator.clipboard.writeText(css);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 animate-enter">
      <Card>
        <CardHeader>
          <CardTitle>预览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border" style={{ height: 240, background: `linear-gradient(${angle}deg, ${c1}, ${c2})` }} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>配置与代码</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>起始颜色</Label>
              <Input type="color" value={c1} onChange={(e) => setC1(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>结束颜色</Label>
              <Input type="color" value={c2} onChange={(e) => setC2(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>角度（{angle}°）</Label>
            <input className="w-full" type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
          </div>
          <Textarea readOnly value={css} rows={4} />
          <Button onClick={copy}>复制 CSS</Button>
        </CardContent>
      </Card>
    </div>
  );
};
