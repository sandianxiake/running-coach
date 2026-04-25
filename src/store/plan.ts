import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TrainingPlan } from '@/models/types'
import { storage } from '@/utils/storage'

export const usePlanStore = defineStore('plan', () => {
  // 状态
  const plans = ref<TrainingPlan[]>([])
  const loading = ref(false)

  // 计算属性
  const activePlans = computed(() => {
    return plans.value.filter(plan => plan.status === 'active')
  })

  const completedPlans = computed(() => {
    return plans.value.filter(plan => plan.status === 'completed')
  })

  // 初始化：加载训练计划
  const init = () => {
    plans.value = storage.plans.getAll()
  }

  // 添加训练计划
  const addPlan = (plan: Omit<TrainingPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    storage.plans.add(plan)
    plans.value = storage.plans.getAll()
  }

  // 更新训练计划
  const updatePlan = (id: string, updates: Partial<TrainingPlan>) => {
    storage.plans.update(id, updates)
    plans.value = storage.plans.getAll()
  }

  // 删除训练计划
  const deletePlan = (id: string) => {
    storage.plans.delete(id)
    plans.value = storage.plans.getAll()
  }

  // 打卡训练
  const toggleDayComplete = (planId: string, weekNumber: number, dayNumber: number) => {
    const plan = plans.value.find(p => p.id === planId)
    if (!plan) return

    const updatedPlan = { ...plan }
    const week = updatedPlan.weeks.find(w => w.weekNumber === weekNumber)
    if (!week) return

    const day = week.days.find(d => d.dayNumber === dayNumber)
    if (!day) return

    day.completed = !day.completed
    if (day.completed) {
      day.completedAt = new Date().toISOString()
    } else {
      day.completedAt = undefined
    }

    // 检查是否所有天都完成了
    const allDaysCompleted = updatedPlan.weeks.every(week => 
      week.days.every(day => day.completed)
    )

    if (allDaysCompleted) {
      updatedPlan.status = 'completed'
    }

    updatePlan(planId, updatedPlan)
  }

  return {
    plans,
    loading,
    activePlans,
    completedPlans,
    init,
    addPlan,
    updatePlan,
    deletePlan,
    toggleDayComplete,
  }
})
