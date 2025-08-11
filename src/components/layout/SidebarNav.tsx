import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import {
  CalculatorOutlined,
  FontSizeOutlined,
  CodeOutlined,
  PictureOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const { Sider } = Layout;

type ItemType = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: ItemType[];
};

const groupedItems: ItemType[] = [
  {
    key: "common",
    label: "通用",
    icon: <AppstoreOutlined />,
    children: [
      { key: "/calculator", label: "计算器", icon: <CalculatorOutlined /> },
    ],
  },
  {
    key: "text-cat",
    label: "文本处理",
    icon: <FontSizeOutlined />,
    children: [
      { key: "/text", label: "文本处理", icon: <FontSizeOutlined /> },
    ],
  },
  {
    key: "code-cat",
    label: "代码处理",
    icon: <CodeOutlined />,
    children: [
      { key: "/json", label: "JSON 格式化", icon: <CodeOutlined /> },
    ],
  },
  {
    key: "image-cat",
    label: "图像处理",
    icon: <PictureOutlined />,
    children: [
      { key: "/image", label: "图像编辑", icon: <PictureOutlined /> },
    ],
  },
];

function filterGroups(q: string): ItemType[] {
  if (!q) return groupedItems;
  const low = q.trim().toLowerCase();
  return groupedItems
    .map((g) => ({
      ...g,
      children: (g.children || []).filter(
        (c) => c.label.toLowerCase().includes(low) || c.key.toLowerCase().includes(low)
      ),
    }))
    .filter((g) => (g.children && g.children.length > 0));
}

function findGroupKeyByPath(path: string): string | undefined {
  for (const g of groupedItems) {
    if (g.children?.some((c) => c.key === path)) return g.key;
  }
  return undefined;
}

export const SidebarNav = () => {
  const { search } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const items = useMemo(() => filterGroups(search), [search]);

  const selectedKey = location.pathname;
  const computedOpen = useMemo(() => {
    if (search.trim()) {
      // 打开所有有匹配项的分组
      return items.map((g) => g.key);
    }
    const g = findGroupKeyByPath(selectedKey);
    return g ? [g] : [];
  }, [items, search, selectedKey]);

  const [openKeys, setOpenKeys] = useState<string[]>(computedOpen);
  useEffect(() => setOpenKeys(computedOpen), [computedOpen]);

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
        selectedKeys={[selectedKey]}
        items={items as any}
        onClick={(info) => navigate(info.key)}
        openKeys={openKeys}
        onOpenChange={(ks) => setOpenKeys(ks as string[])}
        style={{ background: "hsl(var(--sidebar-background))", color: "hsl(var(--sidebar-foreground))" }}
      />
    </Sider>
  );
};
