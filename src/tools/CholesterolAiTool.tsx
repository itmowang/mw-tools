import React, { useState } from 'react';
import { Button, Input, Card, Alert, Tag, Divider, Spin, Typography, Row, Col, Form } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { HeartOutlined, ExclamationCircleOutlined, SafetyOutlined, WarningOutlined, SettingOutlined, BulbOutlined, AppleOutlined, RiseOutlined } from '@ant-design/icons';
import { useAppStore } from "@/store/appStore";
import { useToast } from "@/hooks/use-toast";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface AnalysisResult {
  cholesterolLevel: string;
  healthRisk: string;
  recommendations: string[];
  alternatives: string[];
  gallstoneAdvice: string;
  postCholecystectomyAdvice: string;
  dailyIntakePercentage: string;
  dailyIntakeAmount: string;
  riskLevel: "低风险" | "中等风险" | "高风险";
  summary: string;
}

export const CholesterolAiTool = () => {
  const [foodInput, setFoodInput] = useState("");
  const [userAge, setUserAge] = useState("");
  const [userWeight, setUserWeight] = useState("");
  const [userHeight, setUserHeight] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  
  const { aiApiKey, setAiApiKey } = useAppStore();
  const { toast } = useToast();

  const analyzeFood = async () => {
    if (!foodInput.trim()) {
      toast({
        title: "请输入食物",
        description: "请输入要分析的食物名称或描述",
        variant: "destructive",
      });
      return;
    }

    if (!aiApiKey) {
      toast({
        title: "请配置 AI API Key",
        description: "请先在设置中配置 Google Gemini API Key",
        variant: "destructive",
      });
      setShowSettings(true);
      return;
    }

    setLoading(true);
    try {
      // 动态导入 Google Generative AI
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(aiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const prompt = `你是一位专业的营养师和医学专家。请严格按照以下JSON格式分析食物的胆固醇含量和健康影响。

食物: ${foodInput}
${userAge ? `用户年龄: ${userAge}岁` : ''}
${userWeight && userHeight ? `用户BMI参考: 体重${userWeight}kg, 身高${userHeight}cm` : ''}

请严格按照以下JSON格式返回，不要添加任何额外的文字说明，只返回纯JSON：

{
  "cholesterolLevel": "胆固醇含量描述（如：高胆固醇：每100g含XXXmg）",
  "healthRisk": "健康风险评估（如：高风险、中等风险、低风险）",
  "riskLevel": "低风险",
  "recommendations": ["建议1", "建议2", "建议3"],
  "alternatives": ["替代食物1", "替代食物2", "替代食物3"],
  "gallstoneAdvice": "针对胆结石患者的具体饮食建议",
  "postCholecystectomyAdvice": "胆囊切除术后患者的饮食注意事项",
  "dailyIntakePercentage": "5",
  "dailyIntakeAmount": "建议每日摄入量（如：50-100g）",
  "summary": "综合健康建议总结"
}

注意：
- riskLevel必须是"低风险"、"中等风险"或"高风险"之一
- dailyIntakePercentage只返回数字，不要百分号和其他文字
- 请确保返回的是有效的JSON格式，用中文回答，建议要实用且具体。`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error('AI 响应为空');
      }

      // 清理响应文本，移除markdown代码块标记
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // 尝试解析JSON
      try {
        const analysisResult = JSON.parse(cleanText);
        // 验证必需字段
        if (analysisResult.cholesterolLevel && analysisResult.healthRisk) {
          setResult(analysisResult);
        } else {
          throw new Error('缺少必需字段');
        }
      } catch (parseError) {
        // 如果JSON解析失败，创建一个简单的结果
        setResult({
          cholesterolLevel: "解析失败",
          healthRisk: "无法评估",
          riskLevel: "中等风险",
          recommendations: ["请重新尝试分析", "检查网络连接"],
          alternatives: [],
          gallstoneAdvice: "请咨询医生",
          postCholecystectomyAdvice: "请咨询医生",
          dailyIntakePercentage: "5",
          dailyIntakeAmount: "无法确定",
          summary: `原始响应: ${text.substring(0, 200)}...`
        });
      }

      toast({
        title: "分析完成",
        description: "胆固醇食物分析已完成",
      });

    } catch (error) {
      console.error('分析失败:', error);
      toast({
        title: "分析失败",
        description: error instanceof Error ? error.message : "请检查网络连接和 API Key",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 生成图表数据
  const generateChartData = () => {
    if (!result) return [];
    
    const percentage = parseFloat(result.dailyIntakePercentage) || 5;
    const remaining = Math.max(0, 100 - percentage);
    
    return [
      {
        name: '该食物建议摄入',
        value: percentage,
        color: getRiskColor(result.riskLevel)
      },
      {
        name: '其他食物',
        value: remaining,
        color: '#e5e7eb'
      }
    ];
  };

  // 根据风险等级获取颜色
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case '低风险': return '#52c41a'; // green
      case '中等风险': return '#faad14'; // yellow
      case '高风险': return '#f5222d'; // red
      default: return '#8c8c8c'; // gray
    }
  };

  // 获取风险等级的图标
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case '低风险': return <SafetyOutlined style={{ color: '#52c41a' }} />;
      case '中等风险': return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case '高风险': return <WarningOutlined style={{ color: '#f5222d' }} />;
      default: return null;
    }
  };

  const saveApiKey = () => {
    if (tempApiKey.trim()) {
      setAiApiKey(tempApiKey.trim());
      setTempApiKey("");
      setShowSettings(false);
      toast({
        title: "设置已保存",
        description: "AI API Key 已保存到本地缓存",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 设置卡片 */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Title level={4} className="mb-0 flex items-center">
              <SettingOutlined className="mr-2" />
              AI 设置
            </Title>
            <Button
              type="default"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? "收起" : "配置"}
            </Button>
          </div>
          <Paragraph className="text-muted-foreground mb-0">
            配置 Google Gemini API Key 以使用 AI 分析功能
          </Paragraph>
          
          {showSettings && (
            <div className="mt-6 space-y-4">
              <div>
                <Text strong>Google Gemini API Key</Text>
                <Row gutter={8} className="mt-2">
                  <Col flex="auto">
                    <Input.Password
                      placeholder="请输入 Gemini API Key"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Button type="primary" onClick={saveApiKey} disabled={!tempApiKey.trim()}>
                      保存
                    </Button>
                  </Col>
                </Row>
              </div>
              {aiApiKey && (
                <Alert
                  type="success"
                  message={`API Key 已配置 (***${aiApiKey.slice(-4)})`}
                  showIcon
                />
              )}
              <Alert
                type="info"
                message={
                  <span>
                    获取免费 API Key: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
                  </span>
                }
                showIcon
              />
            </div>
          )}
        </div>
      </Card>

      {/* 输入卡片 */}
      <Card>
        <div className="p-6">
          <Title level={4} className="mb-4 flex items-center">
            <AppleOutlined className="mr-2" />
            食物信息输入
          </Title>
          <Paragraph className="text-muted-foreground mb-6">
            输入要分析的食物名称或描述，以及您的基本信息（可选）
          </Paragraph>
          
          <div className="space-y-4">
            <div>
              <Text strong>食物名称或描述</Text>
              <TextArea
                className="mt-2"
                placeholder="例如：炸鸡、牛排、鸡蛋、奶油蛋糕等"
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                rows={3}
              />
            </div>
            
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>年龄（可选）</Text>
                <Input
                  className="mt-2"
                  type="number"
                  placeholder="30"
                  value={userAge}
                  onChange={(e) => setUserAge(e.target.value)}
                />
              </Col>
              <Col span={8}>
                <Text strong>体重（可选）</Text>
                <Input
                  className="mt-2"
                  type="number"
                  placeholder="70"
                  value={userWeight}
                  onChange={(e) => setUserWeight(e.target.value)}
                />
              </Col>
              <Col span={8}>
                <Text strong>身高（可选）</Text>
                <Input
                  className="mt-2"
                  type="number"
                  placeholder="170"
                  value={userHeight}
                  onChange={(e) => setUserHeight(e.target.value)}
                />
              </Col>
            </Row>

            <Button 
              type="primary"
              size="large"
              onClick={analyzeFood} 
              disabled={loading || !foodInput.trim() || !aiApiKey}
              className="w-full"
              icon={loading ? undefined : <BulbOutlined />}
              loading={loading}
            >
              {loading ? 'AI 分析中...' : '开始 AI 分析'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 结果卡片 */}
      {result && (
        <Card>
          <div className="p-6">
            <Title level={4} className="mb-6 flex items-center">
              <HeartOutlined className="mr-2" />
              分析结果
            </Title>
            
            {/* 概览卡片 */}
            <Row gutter={16} className="mb-6">
              <Col span={8}>
                <Card size="small" className="h-full border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text type="secondary">胆固醇含量</Text>
                      <div className="text-lg font-bold mt-1">{result.cholesterolLevel}</div>
                    </div>
                    <HeartOutlined style={{ fontSize: 24, opacity: 0.6 }} />
                  </div>
                </Card>
              </Col>
              
              <Col span={8}>
                <Card size="small" className={`h-full border-l-4 ${result.riskLevel === '高风险' ? 'border-l-red-500' : result.riskLevel === '中等风险' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text type="secondary">风险等级</Text>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRiskIcon(result.riskLevel)}
                        <Tag color={result.riskLevel === '高风险' ? 'red' : result.riskLevel === '中等风险' ? 'orange' : 'green'}>
                          {result.riskLevel}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Col span={8}>
                <Card size="small" className="h-full border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text type="secondary">建议每日摄入</Text>
                      <div className="text-lg font-bold mt-1">{result.dailyIntakeAmount}</div>
                    </div>
                    <AppleOutlined style={{ fontSize: 24, opacity: 0.6 }} />
                  </div>
                </Card>
              </Col>
            </Row>

            {/* 每日摄入百分比图表 */}
            <Card className="mb-6">
              <div className="p-4">
                <Title level={5} className="mb-2 flex items-center">
                  <RiseOutlined className="mr-2" />
                  每日摄入占比建议
                </Title>
                <Paragraph type="secondary" className="mb-4">
                  该食物在每日总热量中的建议占比
                </Paragraph>
                
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={generateChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {generateChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, '占比']}
                        labelFormatter={(label) => label}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <Text className="text-center block">
                    <span className="font-semibold" style={{ color: getRiskColor(result.riskLevel) }}>
                      {result.dailyIntakePercentage}%
                    </span>
                    {' '}是该食物在每日饮食中的建议占比
                  </Text>
                </div>
              </div>
            </Card>

            {/* 综合建议和总结 */}
            <Row gutter={16} className="mb-6">
              <Col span={12}>
                <Card size="small">
                  <Title level={5} className="mb-3">一般建议</Title>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <Text type="secondary">{rec}</Text>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small">
                  <Title level={5} className="mb-3">健康总结</Title>
                  <Paragraph type="secondary" className="text-sm leading-relaxed mb-0">
                    {result.summary}
                  </Paragraph>
                </Card>
              </Col>
            </Row>

            {/* 专业建议 */}
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Title level={5} className="mb-3 flex items-center">
                    <ExclamationCircleOutlined className="mr-2 text-orange-500" />
                    胆结石患者建议
                  </Title>
                  <Paragraph type="secondary" className="text-sm leading-relaxed mb-0">
                    {result.gallstoneAdvice}
                  </Paragraph>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small">
                  <Title level={5} className="mb-3 flex items-center">
                    <SafetyOutlined className="mr-2 text-blue-500" />
                    胆囊切除后建议
                  </Title>
                  <Paragraph type="secondary" className="text-sm leading-relaxed mb-0">
                    {result.postCholecystectomyAdvice}
                  </Paragraph>
                </Card>
              </Col>
            </Row>

            {result.alternatives.length > 0 && (
              <>
                <Divider />
                <Card size="small">
                  <Title level={5} className="mb-3">健康替代食物</Title>
                  <div className="space-x-2">
                    {result.alternatives.map((alt, idx) => (
                      <Tag key={idx} color="green" className="mb-2">
                        {alt}
                      </Tag>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};