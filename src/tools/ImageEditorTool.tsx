import { Card, Upload, Slider, Space, Button, Row, Col } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";

export const ImageEditorTool = () => {
  const [image, setImage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!image || !canvasRef.current || !imgRef.current) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.filter = `brightness(${brightness}%) grayscale(${grayscale}%)`;
    ctx.drawImage(img, 0, 0);
  }, [image, brightness, grayscale]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "edited.png";
    a.click();
  };

  return (
    <Card title="图像编辑" className="hover-scale">
      <Space direction="vertical" className="w-full">
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            const reader = new FileReader();
            reader.onload = () => setImage(String(reader.result));
            reader.readAsDataURL(file);
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>选择图像</Button>
        </Upload>

        {image && (
          <>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <div className="border rounded-md p-3 bg-card">
                  <img ref={imgRef} src={image} alt="原图" className="max-w-full h-auto" onLoad={() => {
                    // trigger initial draw
                    setBrightness((b) => b);
                  }} />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="border rounded-md p-3 bg-card">
                  <canvas ref={canvasRef} className="max-w-full h-auto" />
                </div>
              </Col>
            </Row>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                亮度
                <Slider min={50} max={150} value={brightness} onChange={setBrightness} />
              </div>
              <div>
                灰度
                <Slider min={0} max={100} value={grayscale} onChange={setGrayscale} />
              </div>
            </div>

            <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>下载结果</Button>
          </>
        )}
      </Space>
    </Card>
  );
};
