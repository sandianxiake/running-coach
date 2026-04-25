import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RunningRecord } from '@/models/types'
import { storage } from '@/utils/storage'

export const useRunningStore = defineStore('running', () => {
  // 状态
  const records = ref<RunningRecord[]>([])
  const loading = ref(false)

  // 计算属性
  const totalDistance = computed(() => {
    return records.value.reduce((sum, record) => sum + record.distance, 0)
  })

  const totalDuration = computed(() => {
    return records.value.reduce((sum, record) => sum + record.duration, 0)
  })

  const totalCalories = computed(() => {
    return records.value.reduce((sum, record) => sum + record.calories, 0)
  })

  const recentRuns = computed(() => {
    return records.value.slice(0, 10)
  })

  // 初始化：加载跑步记录
  const init = () => {
    records.value = storage.records.getAll()
  }

  // 添加跑步记录
  const addRecord = (record: Omit<RunningRecord, 'id' | 'createdAt'>) => {
    storage.records.add(record)
    records.value = storage.records.getAll()
  }

  // 更新跑步记录
  const updateRecord = (id: string, updates: Partial<RunningRecord>) => {
    storage.records.update(id, updates)
    records.value = storage.records.getAll()
  }

  // 删除跑步记录
  const deleteRecord = (id: string) => {
    storage.records.delete(id)
    records.value = storage.records.getAll()
  }

  // 计算月跑量
  const getMonthlyMileage = (month: number, year: number) => {
    return records.value
      .filter(record => {
        const recordDate = new Date(record.date)
        return recordDate.getMonth() === month - 1 && recordDate.getFullYear() === year
      })
      .reduce((sum, record) => sum + record.distance, 0)
  }

  // 获取最长单次距离
  const getLongestRun = () => {
    if (records.value.length === 0) return 0
    return Math.max(...records.value.map(record => record.distance))
  }

  // 获取平均配速
  const getAveragePace = () => {
    if (records.value.length === 0) return '00:00'
    const totalDistance = records.value.reduce((sum, record) => sum + record.distance, 0)
    const totalSeconds = records.value.reduce((sum, record) => sum + record.duration, 0)
    const paceSeconds = totalSeconds / totalDistance
    const min = Math.floor(paceSeconds / 60)
    const sec = Math.floor(paceSeconds % 60)
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return {
    records,
    loading,
    totalDistance,
    totalDuration,
    totalCalories,
    recentRuns,
    init,
    addRecord,
    updateRecord,
    deleteRecord,
    getMonthlyMileage,
    getLongestRun,
    getAveragePace,
  }
})
