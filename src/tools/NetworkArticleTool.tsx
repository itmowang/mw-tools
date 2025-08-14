import React, { useState } from 'react';
import { Button, Input, Card, Alert, Spin, Typography, Row, Col, Tag, Divider } from 'antd';
import { SearchOutlined, FileTextOutlined, GlobalOutlined, BulbOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface ArticleResult {
  title: string;
  summary: string;
  keyPoints: string[];
  uniqueViewpoint: string;
  relatedTopics: string[];
  sources: string[];
}

const NetworkArticleTool: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArticleResult | null>(null);
  const [error, setError] = useState('');

  const PERPLEXITY_API_KEY = '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';

  const generateArticle = async () => {
    if (!topic.trim()) {
      setError('请输入要搜索的话题');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: `你是一个专业的文章生成器。请搜索关于用户话题的最新网络信息，并生成一篇结构化的文章总结。

要求：
1. 搜索最新的相关信息和热点
2. 提供简洁的文章标题
3. 写出400-600字的文章摘要
4. 提取3-5个关键要点
5. 提供一个独特的观点或分析角度
6. 列出2-3个相关话题
7. 提及信息来源

请严格按照以下JSON格式返回：
{
  "title": "文章标题",
  "summary": "文章摘要内容",
  "keyPoints": ["要点1", "要点2", "要点3"],
  "uniqueViewpoint": "独特观点或分析",
  "relatedTopics": ["相关话题1", "相关话题2"],
  "sources": ["来源1", "来源2"]
}`
            },
            {
              role: 'user',
              content: `请搜索并生成关于"${topic}"的文章总结`
            }
          ],
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 2000,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: 'week',
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('API返回内容为空');
      }

      // 尝试解析JSON
      let parsedResult: ArticleResult;
      try {
        // 提取JSON部分（去除可能的额外文本）
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('返回内容不包含有效的JSON格式');
        }
        parsedResult = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON解析错误:', parseError);
        throw new Error('返回的数据格式不正确，请重试');
      }

      // 验证必要字段
      if (!parsedResult.title || !parsedResult.summary) {
        throw new Error('返回数据缺少必要字段');
      }

      setResult(parsedResult);
    } catch (err) {
      console.error('生成文章失败:', err);
      setError(err instanceof Error ? err.message : '生成文章时发生未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Card>
        <div className="p-6">
          <Title level={2} className="mb-4">
            <GlobalOutlined className="mr-2" />
            网络文章生成器
          </Title>
          <Paragraph type="secondary" className="mb-6">
            基于Perplexity AI搜索最新网络热点，生成具有独特观点的文章总结
          </Paragraph>

          <Row gutter={16} align="middle" className="mb-6">
            <Col flex="auto">
              <Input
                size="large"
                placeholder="输入您想了解的话题或关键词..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onPressEnter={generateArticle}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col>
              <Button 
                type="primary" 
                size="large"
                onClick={generateArticle}
                loading={loading}
                icon={<FileTextOutlined />}
              >
                生成文章
              </Button>
            </Col>
          </Row>

          {error && (
            <Alert
              type="error"
              message="生成失败"
              description={error}
              className="mb-6"
              showIcon
            />
          )}

          {loading && (
            <div className="text-center py-12">
              <Spin size="large" />
              <div className="mt-4">
                <Text type="secondary">正在搜索网络热点并生成文章...</Text>
              </div>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* 文章标题 */}
              <Card style={{ borderLeft: '4px solid #1890ff' }}>
                <div className="p-6">
                  <Title level={3} className="mb-0">
                    {result.title}
                  </Title>
                </div>
              </Card>

              <Row gutter={24}>
                {/* 文章摘要 */}
                <Col span={16}>
                  <Card>
                    <div className="p-6">
                      <Title level={4} className="flex items-center mb-4">
                        <FileTextOutlined className="mr-2" />
                        文章摘要
                      </Title>
                      <Paragraph className="text-base leading-relaxed whitespace-pre-wrap">
                        {result.summary}
                      </Paragraph>
                    </div>
                  </Card>
                </Col>

                {/* 侧边信息 */}
                <Col span={8}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* 关键要点 */}
                    <Card size="small">
                      <div className="p-4">
                        <Title level={5} className="mb-3">关键要点</Title>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {result.keyPoints.map((point, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="inline-block w-5 h-5 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#1890ff' }}>
                                {index + 1}
                              </span>
                              <Text className="text-sm">{point}</Text>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>

                    {/* 相关话题 */}
                    <Card size="small">
                      <div className="p-4">
                        <Title level={5} className="mb-3">相关话题</Title>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {result.relatedTopics.map((topic, index) => (
                            <Tag key={index} color="blue" className="mb-1">
                              {topic}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </Card>

                    {/* 信息来源 */}
                    <Card size="small">
                      <div className="p-4">
                        <Title level={5} className="mb-3">信息来源</Title>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {result.sources.map((source, index) => (
                            <div key={index}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                • {source}
                              </Text>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                </Col>
              </Row>

              {/* 独特观点 */}
              <Card style={{ background: 'linear-gradient(135deg, #e6f7ff 0%, #f9f0ff 100%)', border: '1px solid #91d5ff' }}>
                <div className="p-6">
                  <Title level={4} className="flex items-center mb-4" style={{ color: '#1890ff' }}>
                    <BulbOutlined className="mr-2" />
                    独特观点
                  </Title>
                  <Paragraph className="text-base mb-0" style={{ color: '#096dd9' }}>
                    {result.uniqueViewpoint}
                  </Paragraph>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NetworkArticleTool;