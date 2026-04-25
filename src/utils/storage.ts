import type { UserProfile, RunningRecord, TrainingPlan, ChatMessage } from '@/models/types'

const STORAGE_KEYS = {
  USER_PROFILE: 'running_coach_user_profile',
  RUNNING_RECORDS: 'running_coach_records',
  TRAINING_PLANS: 'running_coach_plans',
  CHAT_MESSAGES: 'running_coach_chat',
}

export const storage = {
  // 获取数据
  get<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  // 保存数据
  set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value))
  },

  // 删除数据
  remove(key: string): void {
    localStorage.removeItem(key)
  },

  // 用户相关
  user: {
    get(): UserProfile | null {
      return storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE)
    },
    set(profile: UserProfile): void {
      storage.set(STORAGE_KEYS.USER_PROFILE, profile)
    },
    verifyPassword(phone: string, password: string): boolean {
      const profile = this.get()
      return !!(profile && profile.phone === phone && profile.password === password)
    },
    updatePassword(phone: string, oldPassword: string, newPassword: string): boolean {
      const profile = this.get()
      if (profile && profile.phone === phone && profile.password === oldPassword) {
        profile.password = newPassword
        profile.updatedAt = new Date().toISOString()
        this.set(profile)
        return true
      }
      return false
    },
    exists(phone: string): boolean {
      const profile = this.get()
      return !!(profile && profile.phone === phone)
    },
  },

  // 跑步记录相关
  records: {
    getAll(): RunningRecord[] {
      return storage.get<RunningRecord[]>(STORAGE_KEYS.RUNNING_RECORDS) || []
    },
    add(record: Omit<RunningRecord, 'id' | 'createdAt'>): void {
      const records = this.getAll()
      records.unshift({
        ...record,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      })
      storage.set(STORAGE_KEYS.RUNNING_RECORDS, records)
    },
    update(id: string, updates: Partial<RunningRecord>): void {
      const records = this.getAll()
      const index = records.findIndex(r => r.id === id)
      if (index !== -1) {
        records[index] = { ...records[index], ...updates }
        storage.set(STORAGE_KEYS.RUNNING_RECORDS, records)
      }
    },
    delete(id: string): void {
      const records = this.getAll().filter(r => r.id !== id)
      storage.set(STORAGE_KEYS.RUNNING_RECORDS, records)
    },
  },

  // 训练计划相关
  plans: {
    getAll(): TrainingPlan[] {
      return storage.get<TrainingPlan[]>(STORAGE_KEYS.TRAINING_PLANS) || []
    },
    add(plan: Omit<TrainingPlan, 'id' | 'createdAt' | 'updatedAt'>): void {
      const plans = this.getAll()
      plans.unshift({
        ...plan,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      storage.set(STORAGE_KEYS.TRAINING_PLANS, plans)
    },
    update(id: string, updates: Partial<TrainingPlan>): void {
      const plans = this.getAll()
      const index = plans.findIndex(p => p.id === id)
      if (index !== -1) {
        plans[index] = {
          ...plans[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        storage.set(STORAGE_KEYS.TRAINING_PLANS, plans)
      }
    },
    delete(id: string): void {
      const plans = this.getAll().filter(p => p.id !== id)
      storage.set(STORAGE_KEYS.TRAINING_PLANS, plans)
    },
  },

  // 对话历史相关
  chat: {
    getAll(): ChatMessage[] {
      return storage.get<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES) || []
    },
    add(message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
      const messages = this.getAll()
      messages.push({
        ...message,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      })
      storage.set(STORAGE_KEYS.CHAT_MESSAGES, messages)
    },
    clear(): void {
      storage.remove(STORAGE_KEYS.CHAT_MESSAGES)
    },
  },
}
