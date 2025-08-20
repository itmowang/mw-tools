import { useState, useEffect, useRef, useCallback } from "react";
import * as bwipjs from 'bwip-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
      toast.error("生成失败，请检查输入内容和格式要求");
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
        toast.success("已复制到剪贴板");
      } else {
        toast.error("浏览器不支持图片复制功能");
      }
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>条码生成器</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 类型选择 */}
        <div>
          <Label className="text-base font-medium">生成类型</Label>
          <RadioGroup value={codeType} onValueChange={(value: "barcode" | "qrcode") => setCodeType(value)} className="flex gap-6 mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="barcode" id="barcode" />
              <Label htmlFor="barcode">条形码</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="qrcode" id="qrcode" />
              <Label htmlFor="qrcode">二维码</Label>
            </div>
          </RadioGroup>
        </div>

        {/* 内容输入 */}
        <div>
          <Label className="text-base font-medium">内容</Label>
          <Textarea
            placeholder={codeType === "barcode" ? "请输入数字或字符" : "请输入文本或链接"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="mt-2"
          />
        </div>

        {/* 格式选择 */}
        {codeType === "barcode" ? (
          <div>
            <Label className="text-base font-medium">条形码格式</Label>
            <Select value={barcodeType} onValueChange={setBarcodeType}>
              <SelectTrigger className="w-48 mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BARCODE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <Label className="text-base font-medium">二维码格式</Label>
            <Select value={qrcodeType} onValueChange={setQrcodeType}>
              <SelectTrigger className="w-48 mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QRCODE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 参数设置 */}
        <div className="flex flex-wrap gap-6">
          {codeType === "barcode" ? (
            <>
              <div>
                <Label className="text-base font-medium">高度</Label>
                <Select value={barcodeHeight.toString()} onValueChange={(value) => setBarcodeHeight(Number(value))}>
                  <SelectTrigger className="w-32 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[60, 80, 100, 120, 150, 200].map(h => (
                      <SelectItem key={h} value={h.toString()}>{h}px</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-base font-medium">宽度</Label>
                <Select value={barcodeWidth.toString()} onValueChange={(value) => setBarcodeWidth(Number(value))}>
                  <SelectTrigger className="w-32 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(w => (
                      <SelectItem key={w} value={w.toString()}>{w}x</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label className="text-base font-medium">尺寸</Label>
                <Select value={size.toString()} onValueChange={(value) => setSize(Number(value))}>
                  <SelectTrigger className="w-32 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[128, 192, 256, 320, 384].map(s => (
                      <SelectItem key={s} value={s.toString()}>{s}px</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {qrcodeType === "qrcode" && (
                <div>
                  <Label className="text-base font-medium">纠错级别</Label>
                  <Select value={qrcodeErrorLevel} onValueChange={setQrcodeErrorLevel}>
                    <SelectTrigger className="w-32 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QR_ERROR_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button disabled={!dataUrl || isGenerating} onClick={handleDownload}>
            {isGenerating ? "生成中..." : "下载PNG"}
          </Button>
          <Button variant="outline" disabled={!dataUrl || isGenerating} onClick={handleCopy}>
            复制图片
          </Button>
        </div>

        {/* 预览区域 */}
        <div className="flex justify-center py-8 min-h-[200px] border-2 border-dashed border-muted rounded-lg bg-muted/10">
          <canvas 
            ref={canvasRef} 
            style={{ 
              display: dataUrl ? "block" : "none",
              maxWidth: "100%"
            }}
          />
          {!dataUrl && (
            <div className="flex items-center justify-center text-muted-foreground">
              {isGenerating ? "生成中..." : text.trim() ? "请等待生成..." : "请输入内容"}
            </div>
          )}
        </div>

        {/* 格式说明 */}
        <div className="text-sm text-muted-foreground">
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
      </CardContent>
    </Card>
  );
};