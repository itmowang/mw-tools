import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/CodeEditor";
import { marked } from "marked";
import TurndownService from "turndown";

const turndown = new TurndownService();

export const HtmlMarkdownTool = () => {
  const [md, setMd] = useState("# 标题\n\n- 列表\n- 项目\n\n**加粗** 和 `代码`\n");
  const [html, setHtml] = useState("<h1>标题</h1><p><strong>加粗</strong></p>");

  const mdToHtml = useMemo(() => marked.parse(md || "") as string, [md]);
  const htmlToMd = useMemo(() => turndown.turndown(html || ""), [html]);

  useEffect(() => { /* noop to keep SEO updated by ToolsPage */ }, []);

  return (
    <Tabs defaultValue="m2h" className="animate-enter">
      <TabsList>
        <TabsTrigger value="m2h">Markdown → HTML</TabsTrigger>
        <TabsTrigger value="h2m">HTML → Markdown</TabsTrigger>
      </TabsList>
      <TabsContent value="m2h">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Markdown</CardTitle></CardHeader>
            <CardContent>
              <CodeEditor language="markdown" value={md} onChange={setMd} minHeight={280} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>HTML 预览</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded border p-3 bg-muted/30" dangerouslySetInnerHTML={{ __html: mdToHtml }} />
              <div className="mt-3"><Button onClick={() => navigator.clipboard.writeText(mdToHtml)}>复制 HTML</Button></div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="h2m">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>HTML</CardTitle></CardHeader>
            <CardContent>
              <CodeEditor language="markup" value={html} onChange={setHtml} minHeight={280} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Markdown 结果</CardTitle></CardHeader>
            <CardContent>
              <CodeEditor readOnly language="markdown" value={htmlToMd} onChange={() => {}} minHeight={280} />
              <div className="mt-3"><Button onClick={() => navigator.clipboard.writeText(htmlToMd)}>复制 Markdown</Button></div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};
