import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export const CronTool = () => {
  const [m, setM] = useState("*");
  const [h, setH] = useState("*");
  const [dom, setDom] = useState("*");
  const [mon, setMon] = useState("*");
  const [dow, setDow] = useState("*");

  const expr = useMemo(() => `${m} ${h} ${dom} ${mon} ${dow}`, [m, h, dom, mon, dow]);

  const setPreset = (val: string) => {
    const [pm, ph, pdom, pmon, pdow] = val.split(" ");
    setM(pm); setH(ph); setDom(pdom); setMon(pmon); setDow(pdow);
  };

  return (
    <div className="space-y-4 animate-enter">
      <Card>
        <CardHeader>
          <CardTitle>Cron 表达式（5 字段）</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input placeholder="分 m" value={m} onChange={(e) => setM(e.target.value)} />
          <Input placeholder="时 h" value={h} onChange={(e) => setH(e.target.value)} />
          <Input placeholder="日 dom" value={dom} onChange={(e) => setDom(e.target.value)} />
          <Input placeholder="月 mon" value={mon} onChange={(e) => setMon(e.target.value)} />
          <Input placeholder="周 dow" value={dow} onChange={(e) => setDow(e.target.value)} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>结果与预设</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setPreset("* * * * *")}>每分钟</Button>
            <Button size="sm" variant="secondary" onClick={() => setPreset("*/5 * * * *")}>每 5 分钟</Button>
            <Button size="sm" variant="secondary" onClick={() => setPreset("0 9 * * *")}>每日 09:00</Button>
            <Button size="sm" variant="secondary" onClick={() => setPreset("0 9 * * 1")}>每周一 09:00</Button>
          </div>
          <div className="flex items-center gap-2">
            <Input readOnly value={expr} />
            <Button onClick={() => navigator.clipboard.writeText(expr)}>复制</Button>
          </div>
          <p className="text-muted-foreground text-sm">格式：分 时 日 月 周（0-6 表示周日到周六）。支持 *、逗号、区间与步长（如 */5）。</p>
        </CardContent>
      </Card>
    </div>
  );
};
