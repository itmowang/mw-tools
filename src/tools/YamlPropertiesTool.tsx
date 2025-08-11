import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import yaml from "js-yaml";

function flatten(obj: any, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (o: any, p: string) => {
    if (o !== null && typeof o === "object" && !Array.isArray(o)) {
      Object.keys(o).forEach((k) => walk(o[k], p ? `${p}.${k}` : k));
    } else {
      out[p] = String(o);
    }
  };
  walk(obj, prefix);
  return out;
}

function unflatten(map: Record<string, string>): any {
  const root: any = {};
  for (const [k, v] of Object.entries(map)) {
    const parts = k.split(".");
    let cur = root;
    for (let i = 0; i < parts.length; i++) {
      const key = parts[i];
      if (i === parts.length - 1) {
        cur[key] = v;
      } else {
        cur[key] = cur[key] || {};
        cur = cur[key];
      }
    }
  }
  return root;
}

function parseProperties(src: string): Record<string, string> {
  const res: Record<string, string> = {};
  src.split(/\r?\n/).forEach((line) => {
    const l = line.trim();
    if (!l || l.startsWith("#") || l.startsWith(";")) return;
    const idx = l.indexOf("=");
    if (idx === -1) return;
    const key = l.slice(0, idx).trim();
    const val = l.slice(idx + 1).trim();
    res[key] = val;
  });
  return res;
}

function toProperties(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
}

export const YamlPropertiesTool = () => {
  const [mode, setMode] = useState<"y2p" | "p2y">("y2p");
  const [left, setLeft] = useState("foo:\n  bar: baz\nflag: true\nnum: 42\n");
  const [right, setRight] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      setErr("");
      if (mode === "y2p") {
        const obj = yaml.load(left || "") || {};
        const flat = flatten(obj);
        setRight(toProperties(flat));
      } else {
        const map = parseProperties(left || "");
        const obj = unflatten(map);
        setRight(yaml.dump(obj, { skipInvalid: true }));
      }
    } catch (e: any) {
      setErr(e?.message || "转换错误");
      setRight("");
    }
  }, [left, mode]);

  const title = useMemo(() => (mode === "y2p" ? "YAML → Properties" : "Properties → YAML"), [mode]);

  return (
    <div className="grid gap-4 md:grid-cols-2 animate-enter">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-3">
            <Label>方向</Label>
            <select className="border rounded px-2 py-1 bg-background" value={mode} onChange={(e) => setMode(e.target.value as any)}>
              <option value="y2p">YAML → Properties</option>
              <option value="p2y">Properties → YAML</option>
            </select>
          </div>
          <Textarea rows={18} value={left} onChange={(e) => setLeft(e.target.value)} />
          {err && <p className="text-destructive text-sm">{err}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>结果</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea rows={18} value={right} readOnly />
          <div className="mt-3">
            <Button onClick={() => navigator.clipboard.writeText(right)}>复制</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
