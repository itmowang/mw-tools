import { Card, InputNumber, Checkbox, Space, Button, Input, Typography } from "antd";
import { useCallback, useMemo, useState } from "react";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGIT = "0123456789";
const SYMBOL = "!@#$%^&*()_-+=[]{}|:;,.<>?/";

function generatePassword(len: number, sets: string[]) {
  if (len <= 0 || sets.length === 0) return "";
  const chars = sets.join("");
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

export const PasswordTool = () => {
  const [length, setLength] = useState(16);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digit, setDigit] = useState(true);
  const [symbol, setSymbol] = useState(false);
  const [pwd, setPwd] = useState("");

  const sets = useMemo(() => [lower && LOWER, upper && UPPER, digit && DIGIT, symbol && SYMBOL].filter(Boolean) as string[], [lower, upper, digit, symbol]);

  const regen = useCallback(() => setPwd(generatePassword(length, sets)), [length, sets]);

  return (
    <Card title="随机密码生成" className="hover-scale">
      <Space direction="vertical" className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="flex items-center gap-3">
            <Typography.Text>长度</Typography.Text>
            <InputNumber min={6} max={64} value={length} onChange={(v) => setLength(Number(v))} />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Checkbox checked={lower} onChange={(e) => setLower(e.target.checked)}>小写</Checkbox>
            <Checkbox checked={upper} onChange={(e) => setUpper(e.target.checked)}>大写</Checkbox>
            <Checkbox checked={digit} onChange={(e) => setDigit(e.target.checked)}>数字</Checkbox>
            <Checkbox checked={symbol} onChange={(e) => setSymbol(e.target.checked)}>符号</Checkbox>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="primary" onClick={regen}>生成</Button>
          <Button onClick={() => navigator.clipboard.writeText(pwd)} disabled={!pwd}>复制</Button>
        </div>
        <Input value={pwd} readOnly />
      </Space>
    </Card>
  );
};
