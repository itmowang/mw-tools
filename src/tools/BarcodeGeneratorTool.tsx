import { Card, Input, Select, Button, Radio, Space, message } from "antd";
import { useState, useEffect, useRef, useCallback } from "react";
import * as bwipjs from 'bwip-js';

const { Option } = Select;

// 条形码类型 
const BARCODE_TYPES = [
  { value: "code128", label: "Code 128" },
  { value: "code39", label: "Code 39" },
  { value: "ean13", label: "EAN-13" },
  { value: "upca", label: "UPC-A" },
  { value: "itf14", label: "ITF-14" },
];

// 二维码类型
const QRCODE_TYPES = [
  { value: "qrcode", label: "QR Code" },
  { value: "pdf417", label: "PDF417" },
  { value: "datamatrix", label: "DataMatrix" },
];

const QR_ERROR_LEVELS = [
  { value: "L", label: "L (低)" },
  { value: "M", label: "M (中)" },
  { value: "Q", label: "Q (高)" },
  { value: "H", label: "H (最高)" },
];

export const BarcodeGeneratorTool = () => {
  const [codeType, setCodeType] = useState<"barcode" | "qrcode">("barcode");
  const [text, setText] = useState("123456789012");
  const [barcodeType, setBarcodeType] = useState("code128");
  const [qrcodeType, setQrcodeType] = useState("qrcode");
  const [qrcodeErrorLevel, setQrcodeErrorLevel] = useState("M");
  const [size, setSize] = useState(256);
  const [barcodeHeight, setBarcodeHeight] = useState(100);
  const [barcodeWidth, setBarcodeWidth] = useState(2);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCode = useCallback(async () => {
    if (!text.trim()) {
      setDataUrl("");
      return;
    }
    
    if (!canvasRef.current) return;

    setIsGenerating(true);
    try {
      let bcid: string;
      let options: any = {};

      if (codeType === "barcode") {
        bcid = barcodeType;
        options = {
          text: text,
          scale: barcodeWidth,
          height: barcodeHeight,
          includetext: true,
          textxalign: 'center',
        };
      } else {
        bcid = qrcodeType;
        options = {
          text: text,
          scale: 2,
        };
        
        if (qrcodeType === "qrcode") {
          options.eclevel = qrcodeErrorLevel;
        }
      }

      // 使用 bwip-js 生成条码
      bwipjs.toCanvas(canvasRef.current, {
        bcid: bcid,
        ...options
      });

      const url = canvasRef.current.toDataURL("image/png");
      setDataUrl(url);
    } catch (error: any) {
      console.error("生成失败:", error);
      message.error("生成失败，请检查输入内容和格式要求");
      setDataUrl("");
    } finally {
      setIsGenerating(false);
    }
  }, [text, codeType, barcodeType, qrcodeType, qrcodeErrorLevel, barcodeHeight, barcodeWidth]);

  useEffect(() => {
    generateCode();
  }, [generateCode]);

  const handleDownload = () => {
    if (!dataUrl) return;
    
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${codeType === "barcode" ? "barcode" : "qrcode"}_${Date.now()}.png`;
    a.click();
  };

  const handleCopy = async () => {
    if (!dataUrl) return;
    
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        message.success("已复制到剪贴板");
      } else {
        message.error("浏览器不支持图片复制功能");
      }
    } catch {
      message.error("复制失败");
    }
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
            <>
              <div>
                <div className="mb-2 font-medium">高度</div>
                <Select
                  value={barcodeHeight}
                  onChange={setBarcodeHeight}
                  style={{ width: 120 }}
                >
                  {[60, 80, 100, 120, 150, 200].map(h => (
                    <Option key={h} value={h}>{h}px</Option>
                  ))}
                </Select>
              </div>
                <div>
                  <div className="mb-2 font-medium">宽度</div>
                  <Select
                    value={barcodeWidth}
                    onChange={setBarcodeWidth}
                    style={{ width: 120 }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => (
                      <Option key={w} value={w}>{w}x</Option>
                    ))}
                  </Select>
                </div>
            </>
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
              {qrcodeType === "qrcode" && (
                <div>
                  <div className="mb-2 font-medium">纠错级别</div>
                  <Select
                    value={qrcodeErrorLevel}
                    onChange={setQrcodeErrorLevel}
                    style={{ width: 120 }}
                  >
                    {QR_ERROR_LEVELS.map(level => (
                      <Option key={level.value} value={level.value}>
                        {level.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              )}
            </>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button type="primary" disabled={!dataUrl || isGenerating} onClick={handleDownload}>
            {isGenerating ? "生成中..." : "下载PNG"}
          </Button>
          <Button disabled={!dataUrl || isGenerating} onClick={handleCopy}>
            复制图片
          </Button>
        </div>

        {/* 预览区域 */}
        <div className="flex justify-center py-4 min-h-[200px] border border-dashed border-gray-300 rounded-lg bg-white">
          <canvas 
            ref={canvasRef} 
            style={{ 
              display: dataUrl ? "block" : "none",
              maxWidth: "100%", 
              maxHeight: "400px" 
            }}
          />
          {!dataUrl && (
            <div className="flex items-center justify-center text-gray-400">
              {isGenerating ? "生成中..." : text.trim() ? "请等待生成..." : "请输入内容"}
            </div>
          )}
        </div>

        {/* 格式说明 */}
        <div className="text-sm text-gray-500">
          <div className="mb-2 font-medium">格式说明：</div>
          <ul className="list-disc list-inside space-y-1">
            {codeType === "barcode" ? (
              <>
                <li>Code 128: 支持数字、字母和符号</li>
                <li>Code 39: 支持数字、大写字母和部分符号</li>
                <li>EAN-13: 支持13位数字(商品条码)</li>
                <li>UPC-A: 支持12位数字(北美商品条码)</li>
                <li>ITF-14: 支持14位数字(物流条码)</li>
              </>
            ) : (
              <>
                <li>QR Code: 标准二维码，支持各种文本</li>
                <li>PDF417: 高密度条码，适合大量数据存储</li>
                <li>DataMatrix: 紧凑型二维码，适合小空间标识</li>
              </>
            )}
          </ul>
        </div>
      </Space>
    </Card>
  );
};