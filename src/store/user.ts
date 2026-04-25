import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserProfile } from '@/models/types'
import { storage } from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
  // 状态
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!profile.value)
  const isProfileComplete = computed(() => {
    if (!profile.value) return false
    const { nickname, age, gender, height, weight } = profile.value
    return !!(nickname && age && gender && height && weight)
  })

  // 初始化：加载用户资料
  const init = () => {
    const userProfile = storage.user.get()
    profile.value = userProfile
  }

  // 更新用户资料
  const updateProfile = (updates: Partial<UserProfile>) => {
    const currentProfile = profile.value || {
      phone: updates.phone || '',
      password: updates.password || '123456',
      nickname: '',
      age: 0,
      gender: '男' as '男' | '女',
      height: 0,
      weight: 0,
      abilityTags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const newProfile: UserProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    profile.value = newProfile
    storage.user.set(newProfile)
  }

  // 清除用户资料
  const clearProfile = () => {
    profile.value = null
    storage.user.set(null as any)
  }

  return {
    profile,
    loading,
    isLoggedIn,
    isProfileComplete,
    init,
    updateProfile,
    clearProfile,
  }
})
