import { Layout } from "antd";
import { PropsWithChildren } from "react";
import { SidebarNav } from "./SidebarNav";
import { Topbar } from "./Topbar";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppLayout = ({ children }: PropsWithChildren) => {
  const isMobile = useIsMobile();
  return (
    <Layout className="min-h-screen bg-background">
      <SidebarNav />
      <Layout className="transition-all duration-200">
        <Topbar />
        <Layout.Content className="p-4 md:p-6 lg:p-8">
          <div className="animate-enter">
            {children}
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
};
