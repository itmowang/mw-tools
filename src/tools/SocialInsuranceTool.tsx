import { Card, Form, InputNumber, Space, Table, Typography } from "antd";
import { useMemo, useState } from "react";

type Rate = { label: string; personal: number; employer: number; hasPersonal: boolean };

export const SocialInsuranceTool = () => {
  const [base, setBase] = useState<number>(10000);
  const [rates, setRates] = useState<Rate[]>([
    { label: "养老", personal: 8, employer: 16, hasPersonal: true },
    { label: "医疗", personal: 2, employer: 10, hasPersonal: true },
    { label: "失业", personal: 0.5, employer: 0.7, hasPersonal: true },
    { label: "工伤", personal: 0, employer: 0.5, hasPersonal: false },
    { label: "生育", personal: 0, employer: 0.8, hasPersonal: false },
    { label: "公积金", personal: 12, employer: 12, hasPersonal: true },
  ]);

  const data = useMemo(() => {
    const rows = rates.map((r) => {
      const p = (base * r.personal) / 100;
      const e = (base * r.employer) / 100;
      return { ...r, personalAmt: p, employerAmt: e };
    });
    const personalTotal = rows.reduce((s, r) => s + r.personalAmt, 0);
    const employerTotal = rows.reduce((s, r) => s + r.employerAmt, 0);
    return { rows, personalTotal, employerTotal };
  }, [base, rates]);

  return (
    <Card title="五险一金计算" className="hover-scale">
      <Space direction="vertical" className="w-full">
        <Typography.Paragraph type="secondary">
          各地比例有所不同，请按当地政策调整比例与缴费基数。此结果仅供参考。
        </Typography.Paragraph>
        <Form layout="vertical">
          <Form.Item label="缴费基数（元）">
            <InputNumber value={base} onChange={(v) => setBase(v || 0)} className="w-full" step={100} min={0} />
          </Form.Item>
        </Form>

        <Table
          size="small"
          pagination={false}
          columns={[
            { title: "项目", dataIndex: "label" },
            {
              title: "个人比例(%)",
              dataIndex: "personal",
              render: (_: any, r: Rate, i: number) => (
                <InputNumber
                  value={r.personal}
                  min={0}
                  step={0.1}
                  disabled={!r.hasPersonal}
                  onChange={(v) =>
                    setRates((arr) => arr.map((it, idx) => (idx === i ? { ...it, personal: v || 0 } : it)))
                  }
                />
              ),
            },
            {
              title: "单位比例(%)",
              dataIndex: "employer",
              render: (_: any, r: Rate, i: number) => (
                <InputNumber
                  value={r.employer}
                  min={0}
                  step={0.1}
                  onChange={(v) =>
                    setRates((arr) => arr.map((it, idx) => (idx === i ? { ...it, employer: v || 0 } : it)))
                  }
                />
              ),
            },
            { title: "个人(元)", dataIndex: "personalAmt", render: (v: number) => v.toFixed(2) },
            { title: "单位(元)", dataIndex: "employerAmt", render: (v: number) => v.toFixed(2) },
          ]}
          dataSource={data.rows.map((r, i) => ({ key: i, ...r }))}
        />

        <div className="flex justify-end gap-6 text-base">
          <div>个人合计：<b>{data.personalTotal.toFixed(2)}</b> 元</div>
          <div>单位合计：<b>{data.employerTotal.toFixed(2)}</b> 元</div>
        </div>
      </Space>
    </Card>
  );
};

export default SocialInsuranceTool;
