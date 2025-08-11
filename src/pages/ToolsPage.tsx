import { AppLayout } from "@/components/layout/AppLayout";
import { toolMeta, ToolId } from "@/tools/registry";
import { CalculatorTool } from "@/tools/CalculatorTool";
import { TextTool } from "@/tools/TextTool";
import { JsonFormatterTool } from "@/tools/JsonFormatterTool";
import { ImageEditorTool } from "@/tools/ImageEditorTool";
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
