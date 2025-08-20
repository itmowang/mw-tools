import { Card, Input, Select, Button, Radio, Space, message } from "antd";
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

const { Option } = Select;

// 条形码类型
const BARCODE_TYPES = [
  { value: "CODE128", label: "Code 128" },
  { value: "CODE39", label: "Code 39" },
  { value: "EAN13", label: "EAN-13" },
  { value: "UPC", label: "UPC" },
  { value: "ITF14", label: "Interleaved 2 of 5" },
];

// 二维码类型（目前只支持QR Code，其他类型需要额外库）
const QRCODE_TYPES = [
  { value: "QR", label: "QR Code" },
  // 注意：DataMatrix、PDF417、Aztec Code 需要其他库支持
];

const QRCODE_ERROR_LEVELS = [
  { value: "L", label: "L (低)" },
  { value: "M", label: "M (中)" },
  { value: "Q", label: "Q (高)" },
  { value: "H", label: "H (最高)" },
];

export const BarcodeGeneratorTool = () => {
  const [codeType, setCodeType] = useState<"barcode" | "qrcode">("barcode");
  const [text, setText] = useState("123456789012");
  const [barcodeType, setBarcodeType] = useState("CODE128");
  const [qrcodeType, setQrcodeType] = useState("QR");
  const [qrcodeErrorLevel, setQrcodeErrorLevel] = useState("M");
  const [size, setSize] = useState(256);
  const [barcodeHeight, setBarcodeHeight] = useState(100);
  const [dataUrl, setDataUrl] = useState<string>("");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateBarcode = () => {
    if (!canvasRef.current) return;
    
    try {
      JsBarcode(canvasRef.current, text, {
        format: barcodeType,
        width: 2,
        height: barcodeHeight,
        displayValue: true,
        fontSize: 14,
        margin: 10,
      });
      
      const url = canvasRef.current.toDataURL("image/png");
      setDataUrl(url);
    } catch (error) {
      console.error("条形码生成失败:", error);
      setDataUrl("");
    }
  };

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: qrcodeErrorLevel as any,
      });
      setDataUrl(url);
    } catch (error) {
      console.error("二维码生成失败:", error);
      setDataUrl("");
    }
  };

  useEffect(() => {
    const generateCode = async () => {
      if (!text.trim()) {
        setDataUrl("");
        return;
      }

      try {
        if (codeType === "barcode") {
          generateBarcode();
        } else {
          await generateQRCode();
        }
      } catch (error) {
        console.error("生成失败:", error);
        message.error("生成失败，请检查输入内容");
        setDataUrl("");
      }
    };

    generateCode();
  }, [codeType, text, barcodeType, qrcodeErrorLevel, size, barcodeHeight]);

  const handleDownload = () => {
    if (!dataUrl) return;
    
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${codeType === "barcode" ? "barcode" : "qrcode"}.png`;
    a.click();
  };

  const handleCopy = () => {
    if (!dataUrl) return;
    
    // 创建一个临时 canvas 来复制图片到剪贴板
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]).then(() => {
          message.success("已复制到剪贴板");
        });
      })
      .catch(() => {
        message.error("复制失败");
      });
  };

  return (
    <Card title="条码生成器" className="hover-scale">
      <Space direction="vertical" className="w-full" size="large">
        {/* 类型选择 */}
        <div>
          <div className="mb-2 font-medium">生成类型</div>
          <Radio.Group value={codeType} onChange={(e) => setCodeType(e.target.value)}>
            <Radio value="barcode">条形码</Radio>
            <Radio value="qrcode">二维码</Radio>
          </Radio.Group>
        </div>

        {/* 内容输入 */}
        <div>
          <div className="mb-2 font-medium">内容</div>
          <Input.TextArea
            placeholder={codeType === "barcode" ? "请输入数字或字符" : "请输入文本或链接"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
        </div>

        {/* 格式选择 */}
        {codeType === "barcode" ? (
          <div>
            <div className="mb-2 font-medium">条形码格式</div>
            <Select
              value={barcodeType}
              onChange={setBarcodeType}
              style={{ width: 200 }}
            >
              {BARCODE_TYPES.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </div>
        ) : (
          <div>
            <div className="mb-2 font-medium">二维码格式</div>
            <Select
              value={qrcodeType}
              onChange={setQrcodeType}
              style={{ width: 200 }}
            >
              {QRCODE_TYPES.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </div>
        )}

        {/* 参数设置 */}
        <div className="flex flex-wrap gap-4">
          {codeType === "barcode" ? (
            <div>
              <div className="mb-2 font-medium">高度</div>
              <Select
                value={barcodeHeight}
                onChange={setBarcodeHeight}
                style={{ width: 120 }}
              >
                {[60, 80, 100, 120, 150].map(h => (
                  <Option key={h} value={h}>{h}px</Option>
                ))}
              </Select>
            </div>
          ) : (
            <>
              <div>
                <div className="mb-2 font-medium">尺寸</div>
                <Select
                  value={size}
                  onChange={setSize}
                  style={{ width: 120 }}
                >
                  {[128, 192, 256, 320, 384].map(s => (
                    <Option key={s} value={s}>{s}px</Option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-2 font-medium">纠错级别</div>
                <Select
                  value={qrcodeErrorLevel}
                  onChange={setQrcodeErrorLevel}
                  style={{ width: 120 }}
                >
                  {QRCODE_ERROR_LEVELS.map(level => (
                    <Option key={level.value} value={level.value}>
                      {level.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button type="primary" disabled={!dataUrl} onClick={handleDownload}>
            下载PNG
          </Button>
          <Button disabled={!dataUrl} onClick={handleCopy}>
            复制图片
          </Button>
        </div>

        {/* 预览区域 */}
        <div className="flex justify-center py-4 min-h-[200px] border border-dashed border-gray-300 rounded-lg">
          {codeType === "barcode" && (
            <canvas ref={canvasRef} style={{ display: dataUrl ? "block" : "none" }} />
          )}
          {codeType === "qrcode" && dataUrl && (
            <img src={dataUrl} alt="二维码" style={{ maxWidth: size, maxHeight: size }} />
          )}
          {!dataUrl && (
            <div className="flex items-center justify-center text-gray-400">
              {text.trim() ? "生成中..." : "请输入内容"}
            </div>
          )}
        </div>
      </Space>
    </Card>
  );
};