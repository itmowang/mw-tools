import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function hexToRgb(hex: string) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}
function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToRgb(h: number, s: number, l: number) {
  s /= 100; l /= 100; const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)) };
}

export const ColorTool = () => {
  const [hex, setHex] = useState("#4F46E5");
  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null, [rgb]);
  const [delta, setDelta] = useState(10);

  const palette = useMemo(() => {
    if (!hsl) return [] as string[];
    const arr: string[] = [];
    for (let i = -2; i <= 2; i++) {
      const l = Math.max(0, Math.min(100, hsl.l + i * delta));
      const { r, g, b } = hslToRgb(hsl.h, hsl.s, l);
      arr.push(rgbToHex(r, g, b));
    }
    return arr;
  }, [hsl, delta]);

  return (
    <div className="space-y-4 animate-enter">
      <Card>
        <CardHeader>
          <CardTitle>颜色与格式</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4 items-end">
          <div className="md:col-span-1"><Input type="color" value={hex} onChange={(e) => setHex(e.target.value)} /></div>
          <Input className="md:col-span-1" value={hex} onChange={(e) => setHex(e.target.value)} />
          <Input className="md:col-span-1" readOnly value={rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : ""} />
          <Input className="md:col-span-1" readOnly value={hsl ? `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)` : ""} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>调色板（步长 {delta}%）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input className="w-full" type="range" min={2} max={30} value={delta} onChange={(e) => setDelta(Number(e.target.value))} />
          <div className="grid grid-cols-5 gap-3">
            {palette.map((c) => (
              <button key={c} className="rounded border h-16 hover-scale" style={{ background: c }} title={c} onClick={() => navigator.clipboard.writeText(c)} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
