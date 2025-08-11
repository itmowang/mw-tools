import { Card, Form, InputNumber, Radio, Space, Typography, Alert } from "antd";
import { useMemo, useState } from "react";

function calcMonthlyPaymentEqualPrincipalInterest(P: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = Math.max(1, Math.round(years * 12));
  if (r === 0) return P / n;
  const pow = Math.pow(1 + r, n);
  return (P * r * pow) / (pow - 1);
}

export const MortgageTool = () => {
  const [principal, setPrincipal] = useState<number>(100 * 10000);
  const [years, setYears] = useState<number>(30);
  const [origRate, setOrigRate] = useState<number>(4.2);
  const [newRate, setNewRate] = useState<number>(3.8);
  const [type] = useState<"等额本息" | "等额本金">("等额本息");

  const result = useMemo(() => {
    const m1 = calcMonthlyPaymentEqualPrincipalInterest(principal, origRate, years);
    const m2 = calcMonthlyPaymentEqualPrincipalInterest(principal, newRate, years);
    const n = Math.round(years * 12);
    const total1 = m1 * n;
    const total2 = m2 * n;
    return { m1, m2, diff: m1 - m2, total1, total2, interestSaved: total1 - total2 };
  }, [principal, years, origRate, newRate]);

  return (
    <Card title="房贷利率调整计算器" className="hover-scale">
      <Space direction="vertical" className="w-full">
        <Typography.Paragraph type="secondary">
          目前采用 等额本息 方式进行估算，用于比较利率调整前后的月供与总利息变化。
        </Typography.Paragraph>
        <Form layout="vertical">
          <Form.Item label="贷款本金（元）">
            <InputNumber value={principal} onChange={(v) => setPrincipal(v || 0)} className="w-full" step={1000} min={0} />
          </Form.Item>
          <Form.Item label="贷款年限（年）">
            <InputNumber value={years} onChange={(v) => setYears(v || 0)} className="w-full" step={1} min={1} />
          </Form.Item>
          <Form.Item label="原年利率（%）">
            <InputNumber value={origRate} onChange={(v) => setOrigRate(v || 0)} className="w-full" step={0.01} min={0} />
          </Form.Item>
          <Form.Item label="新年利率（%）">
            <InputNumber value={newRate} onChange={(v) => setNewRate(v || 0)} className="w-full" step={0.01} min={0} />
          </Form.Item>
          <Form.Item label="还款方式">
            <Radio.Group value={type}>
              <Radio value="等额本息">等额本息</Radio>
              <Radio value="等额本金" disabled>
                等额本金（即将支持）
              </Radio>
            </Radio.Group>
          </Form.Item>
        </Form>

        <Alert
          type="success"
          message="计算结果"
          description={
            <div className="space-y-1">
              <div>原月供：<b>{result.m1.toFixed(2)}</b> 元</div>
              <div>新月供：<b>{result.m2.toFixed(2)}</b> 元</div>
              <div>月供减少：<b>{result.diff.toFixed(2)}</b> 元</div>
              <div>总还款（原）：<b>{result.total1.toFixed(2)}</b> 元</div>
              <div>总还款（新）：<b>{result.total2.toFixed(2)}</b> 元</div>
              <div>预计节省利息：<b>{result.interestSaved.toFixed(2)}</b> 元</div>
            </div>
          }
          showIcon
        />
      </Space>
    </Card>
  );
};

export default MortgageTool;
