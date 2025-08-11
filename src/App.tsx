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
