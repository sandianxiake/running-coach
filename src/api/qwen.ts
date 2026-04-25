import type { RacePrediction, TrainingPlan, ChatMessage, UserProfile, RunningRecord } from '@/models/types'
import { retrieveKnowledge } from '@/utils/rag'
import { RACE_PREDICTION_PROMPT, TRAINING_PLAN_PROMPT, COACH_CHAT_PROMPT } from '@/utils/prompts'

const QWEN_API_KEY = import.meta.env.VITE_QWEN_API_KEY
const QWEN_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

export const qwen = {
  async generateText(prompt: string, systemPrompt?: string) {
    const messages = []
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    messages.push({ role: 'user', content: prompt })

    try {
      const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${QWEN_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API请求失败:', response.status, errorData)
        throw new Error(`API请求失败: ${response.status} ${errorData.message || ''}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('generateText错误:', error)
      throw error
    }
  },

  async predictRace(userProfile: UserProfile, recentRuns: RunningRecord[]) {
    const prompt = RACE_PREDICTION_PROMPT
      .replace('{nickname}', userProfile.nickname)
      .replace('{age}', userProfile.age.toString())
      .replace('{gender}', userProfile.gender)
      .replace('{height}', userProfile.height.toString())
      .replace('{weight}', userProfile.weight.toString())
      .replace('{recentRuns}', JSON.stringify(recentRuns.slice(0, 10)))

    const result = await this.generateText(prompt)
    return JSON.parse(result) as RacePrediction
  },

  async generateTrainingPlan(options: {
    targetRace: string
    targetDate: string
    monthlyMileage: number
    longestRun: number
    avgPace: string
    totalWeeks: number
  }) {
    const prompt = TRAINING_PLAN_PROMPT
      .replace('{weeks}', options.totalWeeks.toString())
      .replace('{targetRace}', options.targetRace)
      .replace('{monthlyMileage}', options.monthlyMileage.toString())
      .replace('{longestRun}', options.longestRun.toString())
      .replace('{avgPace}', options.avgPace)

    const result = await this.generateText(prompt)
    return JSON.parse(result) as TrainingPlan
  },

  async chatWithCoach(
    userQuestion: string,
    userProfile?: UserProfile,
    recentRuns?: RunningRecord[],
    chatHistory?: ChatMessage[]
  ) {
    // 1. RAG 检索：从知识库找相关内容
    const retrievedKnowledge = retrieveKnowledge(userQuestion, 3)
    
    // 2. 构建用户上下文
    let userContext = ''
    if (userProfile) {
      userContext += `
用户信息：
- 昵称：${userProfile.nickname}
- 年龄：${userProfile.age}岁
- 性别：${userProfile.gender}
- 身高：${userProfile.height}cm
- 体重：${userProfile.weight}kg
`
    }
    
    if (recentRuns && recentRuns.length > 0) {
      userContext += `
最近 5 次跑步记录：
${JSON.stringify(recentRuns.slice(0, 5))}
`
    }
    
    // 3. 构建完整 Prompt（包含 RAG 知识）
    const systemPrompt = COACH_CHAT_PROMPT.replace('{userContext}', userContext)
    
    // 4. 准备对话历史
    const messages = []
    if (chatHistory) {
      messages.push(...chatHistory.map(m => ({
        role: m.role,
        content: m.content
      })))
    }
    messages.push({ role: 'user', content: userQuestion })
    
    // 5. 调用通义千问 API
    const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
      }),
    })
    
    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      retrievedKnowledge
    }
  },
}
