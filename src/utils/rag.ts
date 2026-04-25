import type { KnowledgeItem } from '@/data/runningKnowledgeBase'
import { RUNNING_KNOWLEDGE_BASE } from '@/data/runningKnowledgeBase'

/**
 * 简单关键词匹配检索
 * @param query 用户问题
 * @param topK 返回最相关的 K 条
 */
export const retrieveKnowledge = (query: string, topK: number = 3): KnowledgeItem[] => {
  // 1. 预处理查询：转小写，分词
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/)
  
  // 2. 计算每条知识的匹配分数
  const scoredItems = RUNNING_KNOWLEDGE_BASE.map(item => {
    let score = 0
    
    // 标题匹配（权重高）
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 10
    }
    
    // 关键词匹配
    for (const keyword of item.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 5
      }
    }
    
    // 内容匹配（权重低）
    if (item.content.toLowerCase().includes(queryLower)) {
      score += 2
    }
    
    // 查询词匹配
    for (const word of queryWords) {
      if (word.length > 1) {
        if (item.title.toLowerCase().includes(word)) {
          score += 3
        }
        if (item.content.toLowerCase().includes(word)) {
          score += 1
        }
      }
    }
    
    return { item, score }
  })
  
  // 3. 按分数排序，取前 topK 条
  return scoredItems
    .filter(si => si.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(si => si.item)
}

/**
 * 把检索到的知识格式化为 Prompt 字符串
 */
export const formatKnowledgeForPrompt = (items: KnowledgeItem[]): string => {
  if (items.length === 0) {
    return ''
  }
  
  return `
【相关知识库】
${items.map((item, index) => `
${index + 1}. ${item.title}
${item.content}
`).join('\n')}
`.trim()
}
