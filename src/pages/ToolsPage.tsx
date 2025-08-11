import { AppLayout } from "@/components/layout/AppLayout";
import { toolMeta, ToolId } from "@/tools/registry";
import { CalculatorTool } from "@/tools/CalculatorTool";
import { TextTool } from "@/tools/TextTool";
import { JsonFormatterTool } from "@/tools/JsonFormatterTool";
import { ImageEditorTool } from "@/tools/ImageEditorTool";
import { QrCodeTool } from "@/tools/QrCodeTool";
import { QrCodeBatchTool } from "@/tools/QrCodeBatchTool";
import { Base64Tool } from "@/tools/Base64Tool";
import { UrlTool } from "@/tools/UrlTool";
import { PasswordTool } from "@/tools/PasswordTool";
import { Md5Tool } from "@/tools/Md5Tool";
import { JwtTool } from "@/tools/JwtTool";
import { TimestampTool } from "@/tools/TimestampTool";
import { SvgEditorTool } from "@/tools/SvgEditorTool";
import { CssGradientTool } from "@/tools/CssGradientTool";
import { YamlPropertiesTool } from "@/tools/YamlPropertiesTool";
import { CronTool } from "@/tools/CronTool";
import { RegexTool } from "@/tools/RegexTool";
import { HttpRequestTool } from "@/tools/HttpRequestTool";
import { HtmlMarkdownTool } from "@/tools/HtmlMarkdownTool";
import { ColorTool } from "@/tools/ColorTool";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ToolRenderer = ({ id }: { id: ToolId }) => {
  switch (id) {
    case "calculator":
      return <CalculatorTool />;
    case "text":
      return <TextTool />;
    case "json":
      return <JsonFormatterTool />;
    case "image":
      return <ImageEditorTool />;
    case "qrcode":
      return <QrCodeTool />;
    case "qrcode-batch":
      return <QrCodeBatchTool />;
    case "base64":
      return <Base64Tool />;
    case "url":
      return <UrlTool />;
    case "password":
      return <PasswordTool />;
    case "md5":
      return <Md5Tool />;
    case "jwt":
      return <JwtTool />;
    case "timestamp":
      return <TimestampTool />;
    case "svg":
      return <SvgEditorTool />;
    case "css-gradient":
      return <CssGradientTool />;
    case "yaml-properties":
      return <YamlPropertiesTool />;
    case "cron":
      return <CronTool />;
    case "regex":
      return <RegexTool />;
    case "http":
      return <HttpRequestTool />;
    case "html-markdown":
      return <HtmlMarkdownTool />;
    case "color":
      return <ColorTool />;
    default:
      return null;
  }
};

interface Props { defaultTool: ToolId }

const ToolsPage = ({ defaultTool }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const current: ToolId = useMemo(() => {
    const path = location.pathname.replace(/^\/+/, "");
    // path could be '', 'calculator', etc.
    const id = (path || defaultTool) as ToolId;
    if (!(id in toolMeta)) return defaultTool;
    return id;
  }, [location.pathname, defaultTool]);

  useEffect(() => {
    const meta = toolMeta[current];
    document.title = `Utility Forge｜${meta.title}`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', meta.description);
  }, [current]);

  useEffect(() => {
    // ensure path reflects selected tool
    const path = `/${current}`;
    if (location.pathname !== path) navigate(path, { replace: true });
  }, [current]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{toolMeta[current].title}</h1>
        <p className="text-muted-foreground mb-6">{toolMeta[current].description}</p>
        <ToolRenderer id={current} />
      </div>
    </AppLayout>
  );
};

export default ToolsPage;
