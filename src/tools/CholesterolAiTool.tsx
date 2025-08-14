import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Brain, Heart, Apple, Settings } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  cholesterolLevel: string;
  healthRisk: string;
  recommendations: string[];
  alternatives: string[];
  gallstoneAdvice: string;
  postCholecystectomyAdvice: string;
  dailyIntakePercentage: string;
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
  "recommendations": ["建议1", "建议2", "建议3"],
  "alternatives": ["替代食物1", "替代食物2", "替代食物3"],
  "gallstoneAdvice": "针对胆结石患者的具体饮食建议",
  "postCholecystectomyAdvice": "胆囊切除术后患者的饮食注意事项",
  "dailyIntakePercentage": "建议每日摄入量占总热量的百分比（如：不超过每日总热量的5%）",
  "summary": "综合健康建议总结"
}

请确保返回的是有效的JSON格式，用中文回答，建议要实用且具体。`;

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
          recommendations: ["请重新尝试分析", "检查网络连接"],
          alternatives: [],
          gallstoneAdvice: "请咨询医生",
          postCholecystectomyAdvice: "请咨询医生",
          dailyIntakePercentage: "无法确定",
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">胆固醇含量</h3>
                <p className="text-sm text-muted-foreground">{result.cholesterolLevel}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">健康风险</h3>
                <p className="text-sm text-muted-foreground">{result.healthRisk}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">每日建议摄入量</h3>
                <p className="text-sm text-muted-foreground">{result.dailyIntakePercentage}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">一般建议</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">胆结石患者建议</h3>
              <p className="text-sm text-muted-foreground bg-orange-50 dark:bg-orange-950 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                {result.gallstoneAdvice}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">胆囊切除术后建议</h3>
              <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                {result.postCholecystectomyAdvice}
              </p>
            </div>

            {result.alternatives.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">推荐替代食物</h3>
                <div className="flex flex-wrap gap-2">
                  {result.alternatives.map((alt, idx) => (
                    <span key={idx} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                      {alt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-sm mb-2">总结</h3>
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};