import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Heart, Apple, Settings, TrendingUp, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

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
      case '低风险': return '#10b981'; // green
      case '中等风险': return '#f59e0b'; // yellow
      case '高风险': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  // 获取风险等级的图标
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case '低风险': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case '中等风险': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case '高风险': return <AlertTriangle className="w-4 h-4 text-red-500" />;
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
    <div className="space-y-6">
      {/* 设置卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <CardTitle>AI 设置</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? "收起" : "配置"}
            </Button>
          </div>
          <CardDescription>
            配置 Google Gemini API Key 以使用 AI 分析功能
          </CardDescription>
        </CardHeader>
        {showSettings && (
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="apikey">Google Gemini API Key</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="apikey"
                    type="password"
                    placeholder="请输入 Gemini API Key"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                  />
                  <Button onClick={saveApiKey} disabled={!tempApiKey.trim()}>
                    保存
                  </Button>
                </div>
              </div>
              {aiApiKey && (
                <Alert>
                  <AlertDescription>
                    API Key 已配置 (***{aiApiKey.slice(-4)})
                  </AlertDescription>
                </Alert>
              )}
              <Alert>
                <AlertDescription>
                  获取免费 API Key: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 输入卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Apple className="w-5 h-5" />
            <CardTitle>食物信息输入</CardTitle>
          </div>
          <CardDescription>
            输入要分析的食物名称或描述，以及您的基本信息（可选）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="food">食物名称或描述</Label>
            <Textarea
              id="food"
              placeholder="例如：炸鸡、牛排、鸡蛋、奶油蛋糕等"
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="age">年龄（可选）</Label>
              <Input
                id="age"
                type="number"
                placeholder="30"
                value={userAge}
                onChange={(e) => setUserAge(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="weight">体重（可选）</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                value={userWeight}
                onChange={(e) => setUserWeight(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="height">身高（可选）</Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                value={userHeight}
                onChange={(e) => setUserHeight(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={analyzeFood} 
            disabled={loading || !foodInput.trim() || !aiApiKey}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI 分析中...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                开始 AI 分析
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 结果卡片 */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <CardTitle>分析结果</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 概览卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">胆固醇含量</p>
                      <p className="text-lg font-bold">{result.cholesterolLevel}</p>
                    </div>
                    <Heart className="w-8 h-8 text-primary opacity-60" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`border-l-4 ${result.riskLevel === '高风险' ? 'border-l-red-500' : result.riskLevel === '中等风险' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">风险等级</p>
                      <div className="flex items-center space-x-2">
                        {getRiskIcon(result.riskLevel)}
                        <Badge variant={result.riskLevel === '高风险' ? 'destructive' : result.riskLevel === '中等风险' ? 'default' : 'secondary'}>
                          {result.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">建议每日摄入</p>
                      <p className="text-lg font-bold">{result.dailyIntakeAmount}</p>
                    </div>
                    <Apple className="w-8 h-8 text-blue-500 opacity-60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 每日摄入百分比图表 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>每日摄入占比建议</span>
                </CardTitle>
                <CardDescription>
                  该食物在每日总热量中的建议占比
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-center">
                    <span className="font-semibold" style={{ color: getRiskColor(result.riskLevel) }}>
                      {result.dailyIntakePercentage}%
                    </span>
                    {' '}是该食物在每日饮食中的建议占比
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 综合建议和总结 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">一般建议</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">健康总结</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.summary}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 专业建议 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span>胆结石患者建议</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {result.gallstoneAdvice}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-blue-500" />
                    <span>胆囊切除术后建议</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {result.postCholecystectomyAdvice}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 替代食物推荐 */}
            {result.alternatives.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">推荐替代食物</CardTitle>
                  <CardDescription>
                    这些食物可以作为更健康的替代选择
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.alternatives.map((alt, idx) => (
                      <Badge key={idx} variant="outline" className="px-3 py-1">
                        {alt}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};