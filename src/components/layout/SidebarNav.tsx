import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { CalculatorOutlined, FontSizeOutlined, CodeOutlined, PictureOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const { Sider } = Layout;

const allItems = [
  { key: "/calculator", label: "计算器", icon: <CalculatorOutlined /> },
  { key: "/text", label: "文本处理", icon: <FontSizeOutlined /> },
  { key: "/json", label: "JSON 格式化", icon: <CodeOutlined /> },
  { key: "/image", label: "图像编辑", icon: <PictureOutlined /> },
];

export const SidebarNav = () => {
  const { search } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((i) => i.label.toLowerCase().includes(q) || String(i.key).includes(q));
  }, [search]);

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth={isMobile ? 0 : 64}
      width={240}
      style={{ background: "hsl(var(--sidebar-background))", borderRight: "1px solid hsl(var(--sidebar-border))" }}
      className="sticky top-0 h-screen hidden md:block"
   >
      <div className="h-12 flex items-center px-4 text-sm font-semibold" style={{ color: "hsl(var(--sidebar-foreground))" }}>
        Utility Forge
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={(info) => navigate(info.key)}
        style={{ background: "hsl(var(--sidebar-background))", color: "hsl(var(--sidebar-foreground))" }}
      />
    </Sider>
  );
};
