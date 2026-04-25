// 用户信息
export interface UserProfile {
  phone: string
  password: string
  nickname: string
  age: number
  gender: '男' | '女'
  height: number
  weight: number
  abilityTags: string[]
  createdAt: string
  updatedAt: string
}

// 跑步记录
export interface RunningRecord {
  id: string
  date: string
  duration: number
  distance: number
  calories: number
  avgPace: string
  avgSpeed: number
  avgCadence: number
  avgStride: number
  steps: number
  avgHeartRate: number
  notes?: string
  createdAt: string
}

// 训练计划
export interface TrainingPlan {
  id: string
  targetRace: string
  targetDate: string
  startDate: string
  totalWeeks: number
  status: 'active' | 'completed' | 'paused'
  weeks: PlanWeek[]
  createdAt: string
  updatedAt: string
}

export interface PlanWeek {
  weekNumber: number
  totalDistance: number
  days: PlanDay[]
}

export interface PlanDay {
  dayNumber: number
  workoutType: string
  distance: number
  duration: number
  pace: string
  description: string
  completed: boolean
  completedAt?: string
}

// AI 对话历史
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// 赛事预测结果
export interface RacePrediction {
  halfMarathon: {
    time: string
    pace: string
    confidence: '高' | '中' | '低'
  }
  fullMarathon: {
    time: string
    pace: string
    confidence: '高' | '中' | '低'
  }
  advice: string
  weakness: string
}
