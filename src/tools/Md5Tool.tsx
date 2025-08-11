import { Card, Input, Space, Typography } from "antd";
import md5 from "blueimp-md5";
import { useMemo, useState } from "react";

export const Md5Tool = () => {
  const [text, setText] = useState("");
  const hash = useMemo(() => text ? md5(text) : "", [text]);

  return (
    <Card title="MD5 在线加密" className="hover-scale">
      <Space direction="vertical" className="w-full">
        <Input.TextArea rows={6} placeholder="输入需要计算 MD5 的文本" value={text} onChange={(e) => setText(e.target.value)} />
        <div>
          <Typography.Text type="secondary">MD5</Typography.Text>
          <Input value={hash} readOnly />
        </div>
      </Space>
    </Card>
  );
};
