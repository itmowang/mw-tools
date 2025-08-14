import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import {
  CalculatorOutlined,
  FontSizeOutlined,
  CodeOutlined,
  PictureOutlined,
  AppstoreOutlined,
  QrcodeOutlined,
  LockOutlined,
  FieldTimeOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const { Sider } = Layout;

type ItemType = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: ItemType[];
};

const groupedItems: ItemType[] = [
  {
    key: "common",
    label: "通用",
    icon: <AppstoreOutlined />,
    children: [
      { key: "/calculator", label: "计算器", icon: <CalculatorOutlined /> },
      { key: "/timestamp", label: "时间戳转换", icon: <FieldTimeOutlined /> },
      { key: "/password", label: "随机密码生成", icon: <LockOutlined /> },
      { key: "/color", label: "颜色工具", icon: <AppstoreOutlined /> },
    ],
  },
  {
    key: "life",
    label: "生活日常",
    icon: <AppstoreOutlined />,
    children: [
      { key: "/mortgage", label: "房贷利率调整计算器", icon: <CalculatorOutlined /> },
      { key: "/bmi", label: "BMI 计算", icon: <CalculatorOutlined /> },
      { key: "/social-insurance", label: "五险一金计算", icon: <CalculatorOutlined /> },
    ],
  },
  {
    key: "text-cat",
    label: "文本处理",
    icon: <FontSizeOutlined />,
    children: [
      { key: "/text", label: "文本处理", icon: <FontSizeOutlined /> },
      { key: "/html-markdown", label: "HTML 与 Markdown 互转", icon: <CodeOutlined /> },
    ],
  },
  {
    key: "code-cat",
    label: "代码处理",
    icon: <CodeOutlined />,
    children: [
      { key: "/json", label: "JSON 格式化", icon: <CodeOutlined /> },
      { key: "/base64", label: "Base64 编解码", icon: <CodeOutlined /> },
      { key: "/url", label: "URL 编解码", icon: <LinkOutlined /> },
      { key: "/md5", label: "MD5 在线加密", icon: <CodeOutlined /> },
      { key: "/jwt", label: "JWT 解析工具", icon: <CodeOutlined /> },
      { key: "/css-gradient", label: "CSS 渐变生成器", icon: <CodeOutlined /> },
      { key: "/yaml-properties", label: "YAML 与 Properties 互转", icon: <CodeOutlined /> },
      { key: "/cron", label: "Cron 表达式生成器", icon: <CodeOutlined /> },
      { key: "/regex", label: "正则表达式工具", icon: <CodeOutlined /> },
      { key: "/http", label: "HTTP 请求测试", icon: <LinkOutlined /> },
    ],
  },
  {
    key: "net-media",
    label: "网络与媒体",
    icon: <LinkOutlined />,
    children: [
      { key: "/hls", label: "HLS 在线播放", icon: <LinkOutlined /> },
      { key: "/mp4", label: "MP4 在线播放", icon: <LinkOutlined /> },
      { key: "/mpegts", label: "MPEG-TS 在线播放", icon: <LinkOutlined /> },
      { key: "/flv", label: "FLV 在线播放", icon: <LinkOutlined /> },
      { key: "/websocket", label: "WebSocket 在线测试", icon: <LinkOutlined /> },
    ],
  },
  {
    key: "image-cat",
    label: "图像处理",
    icon: <PictureOutlined />,
    children: [
      { key: "/image", label: "图像编辑", icon: <PictureOutlined /> },
      { key: "/qrcode", label: "二维码生成", icon: <QrcodeOutlined /> },
      { key: "/qrcode-batch", label: "二维码批量生成", icon: <QrcodeOutlined /> },
      { key: "/svg", label: "SVG 编辑器", icon: <PictureOutlined /> },
    ],
  },
  {
    key: "ai",
    label: "AI 功能",
    icon: <AppstoreOutlined />,
    children: [
      { key: "/cholesterol-ai", label: "胆固醇食物建议", icon: <AppstoreOutlined /> },
      { key: "/network-article", label: "网络文章生成器", icon: <CodeOutlined /> },
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
        魔王Web工具箱
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
