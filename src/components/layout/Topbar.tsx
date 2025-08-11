import { Layout, Input, Switch, Tooltip } from "antd";
import { useAppStore } from "@/store/appStore";
import { useNavigate, useLocation } from "react-router-dom";
import { MoonOutlined, SunOutlined, SearchOutlined } from "@ant-design/icons";

export const Topbar = () => {
  const { setSearch, toggleTheme, theme } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout.Header className="flex items-center gap-3 sticky top-0 z-10 bg-background border-b" style={{ boxShadow: "var(--shadow-elevated)" }}>
      <div className="text-lg font-semibold hidden md:block">{location.pathname === "/" ? "计算器" : undefined}</div>
      <div className="flex-1 max-w-2xl mx-auto w-full">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索工具 (如 计算器/文本/JSON/图像)"
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={(e) => {
            const v = (e.target as HTMLInputElement).value.trim();
            if (v) setSearch(v);
          }}
        />
      </div>
      <Tooltip title={theme === "dark" ? "切换为浅色" : "切换为深色"}>
        <div className="flex items-center gap-2">
          <SunOutlined className="text-muted-foreground" />
          <Switch checked={theme === "dark"} onChange={toggleTheme} />
          <MoonOutlined className="text-muted-foreground" />
        </div>
      </Tooltip>
    </Layout.Header>
  );
};
