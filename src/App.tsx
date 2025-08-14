import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ToolsPage from "./pages/ToolsPage";
import NotFound from "./pages/NotFound";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useAppStore } from "./store/appStore";

const queryClient = new QueryClient();

const App = () => {
  const mode = useAppStore((s) => s.theme);

  return (
    <ConfigProvider theme={{ algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ToolsPage defaultTool="calculator" />} />
              <Route path="/calculator" element={<ToolsPage defaultTool="calculator" />} />
              <Route path="/text" element={<ToolsPage defaultTool="text" />} />
              <Route path="/json" element={<ToolsPage defaultTool="json" />} />
              <Route path="/image" element={<ToolsPage defaultTool="image" />} />
              <Route path="/qrcode" element={<ToolsPage defaultTool="qrcode" />} />
              <Route path="/qrcode-batch" element={<ToolsPage defaultTool="qrcode-batch" />} />
              <Route path="/base64" element={<ToolsPage defaultTool="base64" />} />
              <Route path="/url" element={<ToolsPage defaultTool="url" />} />
              <Route path="/password" element={<ToolsPage defaultTool="password" />} />
              <Route path="/md5" element={<ToolsPage defaultTool="md5" />} />
              <Route path="/jwt" element={<ToolsPage defaultTool="jwt" />} />
              <Route path="/timestamp" element={<ToolsPage defaultTool="timestamp" />} />
              <Route path="/svg" element={<ToolsPage defaultTool="svg" />} />
              <Route path="/css-gradient" element={<ToolsPage defaultTool="css-gradient" />} />
              <Route path="/yaml-properties" element={<ToolsPage defaultTool="yaml-properties" />} />
              <Route path="/cron" element={<ToolsPage defaultTool="cron" />} />
              <Route path="/regex" element={<ToolsPage defaultTool="regex" />} />
              <Route path="/http" element={<ToolsPage defaultTool="http" />} />
              <Route path="/html-markdown" element={<ToolsPage defaultTool="html-markdown" />} />
              <Route path="/color" element={<ToolsPage defaultTool="color" />} />
              <Route path="/mortgage" element={<ToolsPage defaultTool="mortgage" />} />
              <Route path="/bmi" element={<ToolsPage defaultTool="bmi" />} />
              <Route path="/social-insurance" element={<ToolsPage defaultTool="social-insurance" />} />
              <Route path="/hls" element={<ToolsPage defaultTool="hls" />} />
              <Route path="/mp4" element={<ToolsPage defaultTool="mp4" />} />
              <Route path="/mpegts" element={<ToolsPage defaultTool="mpegts" />} />
              <Route path="/flv" element={<ToolsPage defaultTool="flv" />} />
              <Route path="/websocket" element={<ToolsPage defaultTool="websocket" />} />
              <Route path="/cholesterol-ai" element={<ToolsPage defaultTool="cholesterol-ai" />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ConfigProvider>
  );
};

export default App;
