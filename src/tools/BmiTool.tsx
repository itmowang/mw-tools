import { Card, Form, InputNumber, Space, Tag } from "antd";
import { useMemo, useState } from "react";

function bmiCategory(bmi: number) {
  if (bmi <= 0 || !isFinite(bmi)) return "-";
  if (bmi < 18.5) return "偏瘦";
  if (bmi < 24) return "正常";
  if (bmi < 28) return "超重";
  return "肥胖";
}

export const BmiTool = () => {
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(65);

  const { bmi, cat } = useMemo(() => {
    const h = heightCm / 100;
    const b = weightKg && h ? weightKg / (h * h) : 0;
    return { bmi: b, cat: bmiCategory(b) };
  }, [heightCm, weightKg]);

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
        </Form>
        <div className="text-lg">
          BMI：<b>{bmi ? bmi.toFixed(2) : "-"}</b> <Tag color={catColor}>{cat}</Tag>
        </div>
      </Space>
    </Card>
  );
};

export default BmiTool;
