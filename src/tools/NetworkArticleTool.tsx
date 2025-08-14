import React, { useState } from 'react';
import { Button, Input, Card, Alert, Spin, Typography, Row, Col, Tag, message, Dropdown } from 'antd';
import { SearchOutlined, FileTextOutlined, GlobalOutlined, BulbOutlined, CopyOutlined, DownOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface ArticleResult {
  title: string;
  summary: string;
  keyPoints: string[];
  uniqueViewpoint: string;
  relatedTopics: string[];
  sources: string[];
}

export const NetworkArticleTool = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ArticleResult | null>(null);
  const [error, setError] = useState('');

  const PERPLEXITY_API_KEY = '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';

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success(`已复制${format}格式到剪贴板`);
    }).catch(() => {
      message.error('复制失败');
    });
  };

  const generateMarkdown = (result: ArticleResult) => {
    return `# ${result.title}

## 文章摘要

${result.summary}

## 关键要点

${result.keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}

## 独特观点

${result.uniqueViewpoint}

## 相关话题

${result.relatedTopics.map(topic => `- ${topic}`).join('\n')}

## 信息来源

${result.sources.map(source => `- ${source}`).join('\n')}`;
  };

  const generatePlainText = (result: ArticleResult) => {
    return `${result.title}

文章摘要：
${result.summary}

关键要点：
${result.keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}

独特观点：
${result.uniqueViewpoint}

相关话题：
${result.relatedTopics.join('、')}

信息来源：
${result.sources.join('、')}`;
  };

  const getCopyMenuItems = (result: ArticleResult) => [
    {
      key: 'markdown',
      label: 'Markdown格式',
      onClick: () => copyToClipboard(generateMarkdown(result), 'Markdown')
    },
    {
      key: 'text',
      label: '纯文本格式',
      onClick: () => copyToClipboard(generatePlainText(result), '纯文本')
    }
  ];

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

      let parsedResult: ArticleResult;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('返回内容不包含有效的JSON格式');
        }
        parsedResult = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON解析错误:', parseError);
        throw new Error('返回的数据格式不正确，请重试');
      }

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
    <div className="max-w-6xl mx-auto p-6">
      <div style={{ marginBottom: '24px' }}>
        <Card>
          <div className="p-6">
            <Title level={2} className="mb-4">
              <GlobalOutlined style={{ marginRight: '8px' }} />
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
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <Card style={{ borderLeft: '4px solid #1890ff' }}>
                    <div className="p-6">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={3} className="mb-0">
                          {result.title}
                        </Title>
                        <Dropdown
                          menu={{ items: getCopyMenuItems(result) }}
                          trigger={['click']}
                        >
                          <Button type="primary" icon={<CopyOutlined />}>
                            复制文章 <DownOutlined />
                          </Button>
                        </Dropdown>
                      </div>
                    </div>
                  </Card>
                </div>

                <Row gutter={24} style={{ marginBottom: '24px' }}>
                  <Col span={16}>
                    <Card>
                      <div className="p-6">
                        <Title level={4} className="mb-4">
                          <FileTextOutlined style={{ marginRight: '8px' }} />
                          文章摘要
                        </Title>
                        <Paragraph className="text-base leading-relaxed">
                          {result.summary}
                        </Paragraph>
                      </div>
                    </Card>
                  </Col>

                  <Col span={8}>
                    <div>
                      <div style={{ marginBottom: '16px' }}>
                        <Card size="small">
                          <div className="p-4">
                            <Title level={5} className="mb-3">关键要点</Title>
                            <div>
                              {result.keyPoints.map((point, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                                  <span 
                                    style={{ 
                                      display: 'flex', 
                                      width: '20px', 
                                      height: '20px', 
                                      backgroundColor: '#1890ff',
                                      color: 'white', 
                                      fontSize: '12px', 
                                      borderRadius: '50%', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                      marginTop: '2px'
                                    }}
                                  >
                                    {index + 1}
                                  </span>
                                  <Text style={{ fontSize: '14px' }}>{point}</Text>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <Card size="small">
                          <div className="p-4">
                            <Title level={5} className="mb-3">相关话题</Title>
                            <div>
                              {result.relatedTopics.map((topic, index) => (
                                <Tag key={index} color="blue" style={{ marginBottom: '4px' }}>
                                  {topic}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        </Card>
                      </div>

                      <div>
                        <Card size="small">
                          <div className="p-4">
                            <Title level={5} className="mb-3">信息来源</Title>
                            <div>
                              {result.sources.map((source, index) => (
                                <div key={index} style={{ marginBottom: '4px' }}>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    • {source}
                                  </Text>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Card style={{ 
                  background: 'linear-gradient(135deg, #e6f7ff 0%, #f9f0ff 100%)', 
                  border: '1px solid #91d5ff' 
                }}>
                  <div className="p-6">
                    <Title level={4} className="mb-4" style={{ color: '#1890ff' }}>
                      <BulbOutlined style={{ marginRight: '8px' }} />
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
    </div>
  );
};