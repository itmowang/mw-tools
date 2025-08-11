import { Card, Input, Space, Radio, Typography, Button } from "antd";
import { useEffect, useMemo, useState } from "react";

function toTs(date: Date) {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    milliseconds: date.getTime(),
  };
}

export const TimestampTool = () => {
  const [tsInput, setTsInput] = useState<string>("");
  const [unit, setUnit] = useState<"s"|"ms">("s");
  const [useUtc, setUseUtc] = useState(false);

  const dateFromTs = useMemo(() => {
    const n = Number(tsInput);
    if (!tsInput || !Number.isFinite(n)) return null;
    const ms = unit === "s" ? n * 1000 : n;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [tsInput, unit]);

  const nowStr = useMemo(() => {
    const d = new Date();
    const pad = (x: number) => String(x).padStart(2, "0");
    const yyyy = useUtc ? d.getUTCFullYear() : d.getFullYear();
    const mm = pad((useUtc ? d.getUTCMonth() : d.getMonth()) + 1);
    const dd = pad(useUtc ? d.getUTCDate() : d.getDate());
    const HH = pad(useUtc ? d.getUTCHours() : d.getHours());
    const MM = pad(useUtc ? d.getUTCMinutes() : d.getMinutes());
    const SS = pad(useUtc ? d.getUTCSeconds() : d.getSeconds());
    return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}`;
  }, [useUtc]);

  const [dtLocal, setDtLocal] = useState<string>("");
  useEffect(() => { setDtLocal(nowStr); }, [nowStr]);

  const dtToTs = useMemo(() => {
    if (!dtLocal) return null;
    // datetime-local is local time
    const d = new Date(dtLocal);
    if (Number.isNaN(d.getTime())) return null;
    return toTs(d);
  }, [dtLocal]);

  return (
    <Card title="时间戳转换" className="hover-scale">
      <Space direction="vertical" className="w-full">
        <div className="flex items-center gap-4">
          <Radio.Group value={useUtc ? "utc" : "local"} onChange={(e) => setUseUtc(e.target.value === "utc")}> 
            <Radio.Button value="local">本地时间</Radio.Button>
            <Radio.Button value="utc">UTC</Radio.Button>
          </Radio.Group>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Typography.Title level={5}>时间戳 ➜ 日期</Typography.Title>
            <div className="flex items-center gap-3">
              <Input placeholder="输入时间戳" value={tsInput} onChange={(e) => setTsInput(e.target.value)} />
              <Radio.Group value={unit} onChange={(e) => setUnit(e.target.value)}>
                <Radio.Button value="s">秒</Radio.Button>
                <Radio.Button value="ms">毫秒</Radio.Button>
              </Radio.Group>
            </div>
            <div className="mt-3 space-y-2">
              {dateFromTs ? (
                <>
                  <div>本地：{dateFromTs.toLocaleString()}</div>
                  <div>UTC：{dateFromTs.toUTCString()}</div>
                </>
              ) : <div className="text-muted-foreground">请输入有效的时间戳</div>}
            </div>
          </div>

          <div>
            <Typography.Title level={5}>日期 ➜ 时间戳</Typography.Title>
            <div className="flex items-center gap-3">
              <Input type="datetime-local" value={dtLocal} onChange={(e) => setDtLocal(e.target.value)} />
              <Button onClick={() => setDtLocal(nowStr)}>现在</Button>
            </div>
            <div className="mt-3 space-y-2">
              {dtToTs ? (
                <>
                  <div>秒：{dtToTs.seconds}</div>
                  <div>毫秒：{dtToTs.milliseconds}</div>
                </>
              ) : <div className="text-muted-foreground">请选择有效的日期时间</div>}
            </div>
          </div>
        </div>
      </Space>
    </Card>
  );
};
