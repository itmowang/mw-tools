import { Card, Input, Typography, Space, Alert } from "antd";
import { useMemo, useState } from "react";

const safeEval = (expr: string): { ok: boolean; result: string } => {
  if (!expr.trim()) return { ok: true, result: "" };
  try {
    // Basic safety: only allow digits, operators, parentheses, decimal, spaces
    if (!/^[-+*/%().,\d\s^]*$/.test(expr)) throw new Error("仅支持数字和算术运算符");
    // Replace ^ with ** for power
    const normalized = expr.replace(/\^/g, "**");
    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict"; return (${normalized})`)();
    if (typeof val === "number" && Number.isFinite(val)) {
      return { ok: true, result: String(val) };
    }
    return { ok: false, result: "表达式无效" };
  } catch (e: any) {
    return { ok: false, result: e.message || "解析错误" };
  }
};

export const CalculatorTool = () => {
  const [expr, setExpr] = useState("");
  const outcome = useMemo(() => safeEval(expr), [expr]);

  return (
    <Card title="计算器" className="hover-scale" styles={{ body: { paddingTop: 16 } }}>
      <Space direction="vertical" className="w-full">
        <Typography.Paragraph type="secondary">支持 + - * / % () 和 幂运算 ^</Typography.Paragraph>
        <Input size="large" placeholder="输入表达式，如 (1+2)*3^2" value={expr} onChange={(e) => setExpr(e.target.value)} />
        {outcome.ok ? (
          <Alert type="success" message="结果" description={<span className="text-xl font-semibold">{outcome.result || ""}</span>} showIcon />
        ) : (
          <Alert type="error" message="错误" description={outcome.result} showIcon />
        )}
      </Space>
    </Card>
  );
};
