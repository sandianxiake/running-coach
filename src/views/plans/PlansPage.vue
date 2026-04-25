<template>
  <div class="plans-container">
    <van-nav-bar 
      title="训练计划" 
      left-text="返回" 
      @click-left="router.back()"
      right-text="生成" 
      @click-right="showGenerateForm = true"
    />
    
    <!-- 活跃计划 -->
    <div class="section">
      <div class="section-title">
        <h3>进行中的计划</h3>
      </div>
      
      <div v-if="planStore.activePlans.length === 0" class="empty-state">
        <p>还没有进行中的训练计划</p>
        <van-button type="primary" size="small" @click="showGenerateForm = true">
          生成新计划
        </van-button>
      </div>
      
      <div 
        v-for="plan in planStore.activePlans" 
        :key="plan.id"
        class="plan-card"
        @click="showPlanDetail(plan)"
      >
        <div class="plan-header">
          <div class="plan-target">{{ plan.targetRace }}</div>
          <div class="plan-status">进行中</div>
        </div>
        <div class="plan-info">
          <div class="info-item">
            <span class="label">目标日期</span>
            <span class="value">{{ formatDate(plan.targetDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">训练周期</span>
            <span class="value">{{ plan.totalWeeks }}周</span>
          </div>
        </div>
        <div class="plan-progress">
          <div class="progress-label">完成进度</div>
          <van-progress 
            :percentage="getPlanProgress(plan)" 
            :stroke-width="8"
            color="#667eea"
          />
        </div>
      </div>
    </div>
    
    <!-- 已完成计划 -->
    <div class="section">
      <div class="section-title">
        <h3>已完成的计划</h3>
      </div>
      
      <div v-if="planStore.completedPlans.length === 0" class="empty-state small">
        <p>还没有已完成的训练计划</p>
      </div>
      
      <div 
        v-for="plan in planStore.completedPlans" 
        :key="plan.id"
        class="plan-card completed"
        @click="showPlanDetail(plan)"
      >
        <div class="plan-header">
          <div class="plan-target">{{ plan.targetRace }}</div>
          <div class="plan-status success">已完成</div>
        </div>
        <div class="plan-info">
          <div class="info-item">
            <span class="label">目标日期</span>
            <span class="value">{{ formatDate(plan.targetDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">训练周期</span>
            <span class="value">{{ plan.totalWeeks }}周</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 生成计划表单 -->
    <van-popup 
      v-model:show="showGenerateForm" 
      position="bottom" 
      round
      style="height: 70vh;"
    >
      <div class="generate-form">
        <div class="form-header">
          <span>生成训练计划</span>
          <span @click="showGenerateForm = false">关闭</span>
        </div>
        
        <van-field
          v-model="newPlan.targetRace"
          label="目标赛事"
          placeholder="如：半程马拉松"
        />
        
        <van-field
          v-model="newPlan.targetDate"
          label="目标日期"
          type="date"
          placeholder="选择日期"
        />
        
        <van-field
          v-model="newPlan.totalWeeks"
          label="训练周期"
          type="number"
          placeholder="如：12"
        />
        
        <div class="form-tips">
          <p>💡 根据你当前的跑步能力，系统会生成适合的训练计划</p>
        </div>
        
        <van-button 
          type="primary" 
          size="large" 
          :loading="generating"
          @click="generatePlan"
        >
          {{ generating ? '生成中...' : '生成计划' }}
        </van-button>
      </div>
    </van-popup>
    
    <!-- 计划详情 -->
    <van-popup 
      v-model:show="showDetail" 
      position="bottom" 
      round
      style="height: 85vh;"
    >
      <div v-if="selectedPlan" class="plan-detail">
        <div class="detail-header">
          <div class="header-title">
            <span>{{ selectedPlan.targetRace }}</span>
            <van-tag :type="selectedPlan.status === 'active' ? 'primary' : 'success'">
              {{ selectedPlan.status === 'active' ? '进行中' : '已完成' }}
            </van-tag>
          </div>
          <span @click="showDetail = false">关闭</span>
        </div>
        
        <div class="detail-info">
          <div class="info-row">
            <span>目标日期：{{ formatDate(selectedPlan.targetDate) }}</span>
            <span>训练周期：{{ selectedPlan.totalWeeks }}周</span>
          </div>
        </div>
        
        <div class="weeks-list">
          <div 
            v-for="week in selectedPlan.weeks" 
            :key="week.weekNumber"
            class="week-card"
          >
            <div class="week-header">
              <span>第{{ week.weekNumber }}周</span>
              <span class="week-distance">{{ week.totalDistance.toFixed(1) }} km</span>
            </div>
            
            <div class="days-list">
              <div 
                v-for="day in week.days" 
                :key="day.dayNumber"
                class="day-item"
                :class="{ completed: day.completed }"
                @click="toggleDayComplete(week.weekNumber, day.dayNumber)"
              >
                <div class="day-checkbox">
                  <van-icon v-if="day.completed" name="checked" color="#667eea" />
                  <van-icon v-else name="circle" />
                </div>
                <div class="day-info">
                  <div class="day-type">{{ day.workoutType }}</div>
                  <div class="day-detail">
                    {{ day.distance.toFixed(1) }}km · {{ day.pace }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-actions">
          <van-button 
            v-if="selectedPlan.status === 'active'" 
            type="danger" 
            size="large"
            @click="deletePlan"
          >
            删除计划
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlanStore } from '@/store/plan'
import { useRunningStore } from '@/store/running'
import { showConfirmDialog, showToast } from 'vant'
import type { TrainingPlan } from '@/models/types'

const router = useRouter()
const planStore = usePlanStore()
const runningStore = useRunningStore()

const showGenerateForm = ref(false)
const showDetail = ref(false)
const generating = ref(false)
const selectedPlan = ref<TrainingPlan | null>(null)

const newPlan = ref({
  targetRace: '',
  targetDate: '',
  totalWeeks: 12,
})

onMounted(() => {
  planStore.init()
  runningStore.init()
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

const getPlanProgress = (plan: TrainingPlan): number => {
  let completedDays = 0
  let totalDays = 0
  
  plan.weeks.forEach(week => {
    week.days.forEach(day => {
      totalDays++
      if (day.completed) completedDays++
    })
  })
  
  return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
}

const generatePlan = () => {
  if (!newPlan.value.targetRace || !newPlan.value.targetDate) {
    showToast('请填写目标赛事和日期')
    return
  }
  
  generating.value = true
  
  setTimeout(() => {
    const weeks = []
    const totalWeeks = newPlan.value.totalWeeks || 12
    
    for (let w = 1; w <= totalWeeks; w++) {
      const days = []
      const baseDistance = 5 + (w * 0.5)
      
      for (let d = 1; d <= 7; d++) {
        let workoutType = '休息'
        let distance = 0
        let duration = 0
        let pace = '05:00'
        
        if (d === 1 || d === 2 || d === 4 || d === 5) {
          workoutType = '轻松跑'
          distance = baseDistance
          duration = Math.round(baseDistance * 6)
          pace = '06:00'
        } else if (d === 3 || d === 6) {
          workoutType = d === 3 ? '间歇跑' : '长距离慢跑'
          distance = d === 3 ? baseDistance * 0.6 : baseDistance * 1.5
          duration = Math.round(distance * (d === 3 ? 5 : 6.5))
          pace = d === 3 ? '05:00' : '06:30'
        }
        
        days.push({
          dayNumber: d,
          workoutType,
          distance,
          duration,
          pace,
          description: getWorkoutDescription(workoutType, distance, pace),
          completed: false,
        })
      }
      
      weeks.push({
        weekNumber: w,
        totalDistance: days.reduce((sum, d) => sum + d.distance, 0),
        days,
      })
    }
    
    planStore.addPlan({
      targetRace: newPlan.value.targetRace,
      targetDate: newPlan.value.targetDate,
      startDate: new Date().toISOString(),
      totalWeeks,
      status: 'active',
      weeks,
    })
    
    generating.value = false
    showGenerateForm.value = false
    showToast('计划生成成功')
    
    newPlan.value = {
      targetRace: '',
      targetDate: '',
      totalWeeks: 12,
    }
  }, 1500)
}

const getWorkoutDescription = (type: string, distance: number, pace: string): string => {
  if (type === '休息') return '完全休息，或进行轻松的拉伸放松'
  if (type === '轻松跑') return `以轻松配速(${pace})跑步${distance.toFixed(1)}公里，保持可以对话的速度`
  if (type === '间歇跑') return `${distance.toFixed(1)}公里间歇训练，每组快跑+慢走恢复`
  if (type === '长距离慢跑') return `${distance.toFixed(1)}公里长距离慢跑，目标是完成距离，不必在意速度`
  return ''
}

const showPlanDetail = (plan: TrainingPlan) => {
  selectedPlan.value = plan
  showDetail.value = true
}

const toggleDayComplete = (weekNumber: number, dayNumber: number) => {
  if (!selectedPlan.value) return
  
  planStore.toggleDayComplete(selectedPlan.value.id, weekNumber, dayNumber)
  
  selectedPlan.value = planStore.plans.find(p => p.id === selectedPlan.value?.id) || null
}

const deletePlan = async () => {
  if (!selectedPlan.value) return
  
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个训练计划吗？',
    })
    
    planStore.deletePlan(selectedPlan.value.id)
    showDetail.value = false
    showToast('删除成功')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.plans-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.section {
  padding: 15px;
  
  .section-title {
    margin-bottom: 12px;
    
    h3 {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 40px 0;
    background: white;
    border-radius: 12px;
    
    &.small {
      padding: 20px 0;
    }
    
    p {
      color: #999;
      margin-bottom: 16px;
    }
  }
}

.plan-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .plan-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    
    .plan-target {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    
    .plan-status {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      background: #667eea;
      color: white;
      
      &.success {
        background: #07c160;
      }
    }
  }
  
  .plan-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    
    .info-item {
      .label {
        font-size: 12px;
        color: #999;
        margin-right: 4px;
      }
      
      .value {
        font-size: 14px;
        color: #333;
      }
    }
  }
  
  .plan-progress {
    .progress-label {
      font-size: 12px;
      color: #999;
      margin-bottom: 6px;
    }
  }
}

.generate-form {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    
    span:first-child {
      font-size: 16px;
      font-weight: bold;
    }
    
    span:last-child {
      color: #667eea;
      font-size: 14px;
    }
  }
  
  .van-field {
    margin-bottom: 12px;
  }
  
  .form-tips {
    background: #f0f0f0;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    
    p {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }
  }
  
  .van-button {
    margin-top: 10px;
  }
}

.plan-detail {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    
    .header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      
      span:first-child {
        font-size: 18px;
        font-weight: bold;
      }
    }
    
    span:last-child {
      color: #667eea;
      font-size: 14px;
    }
  }
  
  .detail-info {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #666;
    }
  }
  
  .weeks-list {
    .week-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      .week-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: bold;
        color: #333;
        
        .week-distance {
          color: #667eea;
        }
      }
      
      .days-list {
        .day-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          
          &:last-child {
            border-bottom: none;
          }
          
          &.completed {
            opacity: 0.6;
            
            .day-type {
              text-decoration: line-through;
            }
          }
          
          .day-checkbox {
            margin-right: 12px;
            font-size: 20px;
          }
          
          .day-info {
            flex: 1;
            
            .day-type {
              font-size: 14px;
              color: #333;
              margin-bottom: 2px;
            }
            
            .day-detail {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }
    }
  }
  
  .detail-actions {
    margin-top: 20px;
  }
}
</style>
