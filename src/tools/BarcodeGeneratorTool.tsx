import React, { useState, useEffect, useRef, useCallback } from "react";
import * as bwipjs from 'bwip-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Copy, Settings, Palette, Type, Maximize } from "lucide-react";

// 条码类型配置
const BARCODE_TYPES = [
  { 
    value: "code128", 
    label: "Code 128", 
    description: "通用工业条码，支持字母数字", 
    category: "1D",
    example: "ABC123456"
  },
  { 
    value: "code39", 
    label: "Code 39", 
    description: "经典条码，支持大写字母数字", 
    category: "1D",
    example: "HELLO123"
  },
  { 
    value: "code93", 
    label: "Code 93", 
    description: "紧凑版Code39，密度更高", 
    category: "1D",
    example: "CODE93"
  },
  { 
    value: "ean13", 
    label: "EAN-13", 
    description: "国际商品条码（13位）", 
    category: "Retail",
    example: "1234567890128"
  },
  { 
    value: "upca", 
    label: "UPC-A", 
    description: "北美商品条码（12位）", 
    category: "Retail",
    example: "123456789012"
  },
  { 
    value: "qrcode", 
    label: "QR Code", 
    description: "二维码，支持大量数据", 
    category: "2D",
    example: "https://example.com"
  },
  { 
    value: "pdf417", 
    label: "PDF417", 
    description: "高密度二维码，适合证件", 
    category: "2D",
    example: "PDF417 Data"
  },
  { 
    value: "datamatrix", 
    label: "DataMatrix", 
    description: "紧凑二维码，工业应用", 
    category: "2D",
    example: "DM123456"
  },
  { 
    value: "gs1-128", 
    label: "GS1-128", 
    description: "物流供应链条码", 
    category: "GS1",
    example: "(01)12345678901231"
  },
  { 
    value: "itf14", 
    label: "ITF-14", 
    description: "物流外箱条码（14位）", 
    category: "Logistics",
    example: "12345678901231"
  }
];

// 输出格式
const OUTPUT_FORMATS = [
  { value: "png", label: "PNG", description: "通用图片格式" },
  { value: "svg", label: "SVG", description: "矢量图格式" }
];

// 预设颜色
const PRESET_COLORS = [
  { name: "经典黑白", fg: "#000000", bg: "#FFFFFF" },
  { name: "深蓝白", fg: "#1e40af", bg: "#FFFFFF" },
  { name: "深绿白", fg: "#166534", bg: "#FFFFFF" },
  { name: "深红白", fg: "#dc2626", bg: "#FFFFFF" },
  { name: "白蓝", fg: "#FFFFFF", bg: "#1e40af" },
];

export const BarcodeGeneratorTool = () => {
  const [text, setText] = useState("HELLO123456");
  const [selectedType, setSelectedType] = useState("code128");
  const [showText, setShowText] = useState(true);
  const [scale, setScale] = useState(2);
  const [height, setHeight] = useState(50);
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [outputFormat, setOutputFormat] = useState("png");
  const [multiPreview, setMultiPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generatedImages, setGeneratedImages] = useState<{[key: string]: string}>({});

  // 获取当前选择的条码类型信息
  const currentBarcodeType = BARCODE_TYPES.find(type => type.value === selectedType);

  const generateBarcode = useCallback(async (barcodeType: string, inputText: string) => {
    if (!inputText.trim()) return null;

    try {
      const canvas = document.createElement('canvas');
      const options: any = {
        bcid: barcodeType,
        text: inputText,
        scale: scale,
        height: height,
        includetext: showText,
        textxalign: 'center',
        textcolor: foregroundColor,
        backgroundcolor: backgroundColor,
      };

      // 特殊条码类型的参数调整
      if (barcodeType === 'qrcode') {
        options.eclevel = 'M';
        delete options.height;
      } else if (barcodeType === 'pdf417') {
        options.columns = 2;
        options.rows = 10;
        delete options.height;
      } else if (barcodeType === 'datamatrix') {
        delete options.height;
      }

      await bwipjs.toCanvas(canvas, options);
      return canvas.toDataURL(outputFormat === 'png' ? 'image/png' : 'image/svg+xml');
    } catch (error) {
      console.error(`生成${barcodeType}失败:`, error);
      return null;
    }
  }, [scale, height, showText, foregroundColor, backgroundColor, outputFormat]);

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      setGeneratedImages({});
      return;
    }

    setIsGenerating(true);
    const images: {[key: string]: string} = {};

    try {
      if (multiPreview) {
        // 生成多种类型预览
        const previewTypes = ['code128', 'qrcode', 'pdf417', 'datamatrix'];
        for (const type of previewTypes) {
          const dataUrl = await generateBarcode(type, text);
          if (dataUrl) {
            images[type] = dataUrl;
          }
        }
      } else {
        // 生成单个条码
        const dataUrl = await generateBarcode(selectedType, text);
        if (dataUrl) {
          images[selectedType] = dataUrl;
        }
      }
      
      setGeneratedImages(images);
    } catch (error) {
      toast.error("生成条码失败，请检查输入内容");
      console.error("生成失败:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [text, selectedType, multiPreview, generateBarcode]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleDownload = (type: string, dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `barcode_${type}_${Date.now()}.${outputFormat}`;
    a.click();
    toast.success(`${type.toUpperCase()} 条码已下载`);
  };

  const handleCopy = async (dataUrl: string) => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        toast.success("条码已复制到剪贴板");
      } else {
        toast.error("浏览器不支持图片复制功能");
      }
    } catch {
      toast.error("复制失败");
    }
  };

  const applyColorPreset = (preset: typeof PRESET_COLORS[0]) => {
    setForegroundColor(preset.fg);
    setBackgroundColor(preset.bg);
    toast.success(`已应用${preset.name}配色`);
  };

  const setExample = () => {
    if (currentBarcodeType) {
      setText(currentBarcodeType.example);
      toast.success("已填入示例文本");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 配置面板 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 基础设置 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                基础设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">条码类型</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BARCODE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {type.category}
                          </Badge>
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentBarcodeType && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentBarcodeType.description}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm font-medium">条码内容</Label>
                  <Button variant="ghost" size="sm" onClick={setExample}>
                    填入示例
                  </Button>
                </div>
                <Textarea
                  placeholder="请输入要生成条码的内容..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="multi-preview"
                  checked={multiPreview}
                  onCheckedChange={setMultiPreview}
                />
                <Label htmlFor="multi-preview" className="text-sm">
                  多类型预览
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* 样式设置 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                样式调整
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">缩放比例</Label>
                  <Select value={scale.toString()} onValueChange={(value) => setScale(Number(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(s => (
                        <SelectItem key={s} value={s.toString()}>{s}x</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">高度</Label>
                  <Select value={height.toString()} onValueChange={(value) => setHeight(Number(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[30, 40, 50, 60, 80, 100].map(h => (
                        <SelectItem key={h} value={h.toString()}>{h}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-text"
                  checked={showText}
                  onCheckedChange={setShowText}
                />
                <Label htmlFor="show-text" className="text-sm">
                  显示文本
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* 颜色设置 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                颜色配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">前景色</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">背景色</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">快速配色</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_COLORS.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => applyColorPreset(preset)}
                      className="justify-start gap-2"
                    >
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: preset.bg, borderColor: preset.fg }}
                      />
                      <span className="text-xs">{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 导出设置 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                导出格式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OUTPUT_FORMATS.map(format => (
                    <SelectItem key={format.value} value={format.value}>
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-xs text-muted-foreground">{format.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* 预览区域 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize className="h-5 w-5" />
                条码预览
                {isGenerating && (
                  <Badge variant="secondary">生成中...</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(generatedImages).length === 0 ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted rounded-lg bg-muted/10">
                  <div className="text-center text-muted-foreground">
                    <Maximize className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {isGenerating ? "正在生成条码..." : text.trim() ? "请等待生成..." : "请输入内容生成条码"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(generatedImages).map(([type, dataUrl]) => {
                    const typeInfo = BARCODE_TYPES.find(t => t.value === type);
                    return (
                      <div key={type} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{typeInfo?.category}</Badge>
                            <h3 className="font-medium">{typeInfo?.label}</h3>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(dataUrl)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              复制
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownload(type, dataUrl)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              下载
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-center p-4 border border-muted rounded-lg bg-background">
                          <img
                            src={dataUrl}
                            alt={`${typeInfo?.label} 条码`}
                            className="max-w-full h-auto"
                            style={{ maxHeight: '300px' }}
                          />
                        </div>
                        {typeInfo?.description && (
                          <p className="text-xs text-muted-foreground text-center">
                            {typeInfo.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">条码类型说明</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li><strong>Code 128:</strong> 工业标准，支持字母数字符号</li>
                <li><strong>QR Code:</strong> 二维码，可存储大量信息</li>
                <li><strong>EAN-13/UPC-A:</strong> 商品条码，需正确位数</li>
                <li><strong>PDF417:</strong> 证件条码，高密度存储</li>
                <li><strong>DataMatrix:</strong> 工业二维码，空间紧凑</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">使用提示</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 不同条码类型对输入格式有不同要求</li>
                <li>• 点击"填入示例"获取正确格式</li>
                <li>• 开启多类型预览可对比不同条码</li>
                <li>• 调整颜色和大小以适应打印需求</li>
                <li>• SVG格式适合高质量打印</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};