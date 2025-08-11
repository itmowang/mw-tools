import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const RegexTool = () => {
  const [pattern, setPattern] = useState("[a-zA-Z]+\\d+");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("User12 and test34 match, but 56 doesn't.");

  const { html, error, count } = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags);
      let c = 0;
      const h = text.replace(re, (m) => {
        c++;
        return `<mark>${m}</mark>`;
      });
      return { html: h, error: "", count: c };
    } catch (e: any) {
      return { html: text, error: e?.message || "正则错误", count: 0 };
    }
  }, [pattern, flags, text]);

  return (
    <div className="space-y-4 animate-enter">
      <Card>
        <CardHeader>
          <CardTitle>正则与文本</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input placeholder="表达式" value={pattern} onChange={(e) => setPattern(e.target.value)} />
          <Input placeholder="标志，如 gim" value={flags} onChange={(e) => setFlags(e.target.value)} />
          <Input readOnly value={`匹配数：${count}`} />
          <div className="md:col-span-3">
            <Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} />
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>高亮结果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-3 bg-muted/30" dangerouslySetInnerHTML={{ __html: html }} />
        </CardContent>
      </Card>
    </div>
  );
};
