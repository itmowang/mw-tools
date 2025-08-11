import { Card, Form, InputNumber, Space, Tag, Select, Table, Typography } from "antd";
import { useMemo, useState } from "react";

type Standard = "CN" | "WHO";

function getCategories(std: Standard) {
  if (std === "WHO") {
    return [
      { label: "偏瘦", range: "< 18.5", min: -Infinity, max: 18.5 },
      { label: "正常", range: "18.5 - 24.9", min: 18.5, max: 24.9 },
      { label: "超重", range: "25.0 - 29.9", min: 25, max: 29.9 },
      { label: "肥胖", range: "≥ 30.0", min: 30, max: Infinity },
    ];
  }
  // 中国成人 BMI 分级（国家卫健委）
  return [
    { label: "偏瘦", range: "< 18.5", min: -Infinity, max: 18.5 },
    { label: "正常", range: "18.5 - 23.9", min: 18.5, max: 23.9 },
    { label: "超重", range: "24.0 - 27.9", min: 24, max: 27.9 },
    { label: "肥胖", range: "≥ 28.0", min: 28, max: Infinity },
  ];
}

function bmiCategory(bmi: number, std: Standard) {
  const cats = getCategories(std);
  const hit = cats.find((c) => bmi >= c.min && bmi < c.max) || { label: "-" } as any;
  return String(hit.label);
}

export const BmiTool = () => {
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(65);
  const [std, setStd] = useState<Standard>("CN");

  const cats = useMemo(() => getCategories(std), [std]);

  const { bmi, cat } = useMemo(() => {
    const h = heightCm / 100;
    const b = weightKg && h ? weightKg / (h * h) : 0;
    return { bmi: b, cat: bmiCategory(b, std) };
  }, [heightCm, weightKg, std]);

  const catColor = cat === "正常" ? "green" : cat === "偏瘦" ? "blue" : cat === "超重" ? "orange" : "red";

  return (
    <Card title="BMI 计算" className="hover-scale">
      <Space direction="vertical" className="w-full">
        <Form layout="vertical">
          <Form.Item label="身高（cm）">
            <InputNumber value={heightCm} onChange={(v) => setHeightCm(v || 0)} className="w-full" step={1} min={1} />
          </Form.Item>
          <Form.Item label="体重（kg）">
            <InputNumber value={weightKg} onChange={(v) => setWeightKg(v || 0)} className="w-full" step={0.1} min={0} />
          </Form.Item>
          <Form.Item label="参考标准">
            <Select
              value={std}
              onChange={(v) => setStd(v)}
              options={[
                { label: "中国（成人）", value: "CN" },
                { label: "WHO（成人）", value: "WHO" },
              ]}
              style={{ width: 200 }}
            />
          </Form.Item>
        </Form>
        <div className="text-lg">
          BMI：<b>{bmi ? bmi.toFixed(2) : "-"}</b> <Tag color={catColor}>{cat}</Tag>
        </div>
        <div>
          <Typography.Title level={5}>参考范围（{std === "CN" ? "中国" : "WHO"}）</Typography.Title>
          <Table
            size="small"
            pagination={false}
            columns={[
              { title: "分类", dataIndex: "label", width: 120 },
              { title: "范围", dataIndex: "range" },
            ]}
            dataSource={cats.map((r, i) => ({ key: i, ...r }))}
            rowClassName={(r) => (r.label === cat ? "bg-primary/5" : "")}
          />
        </div>
      </Space>
    </Card>
  );
};

export default BmiTool;
