<template>
  <div class="records-container">
    <van-nav-bar 
      title="跑步记录" 
      left-text="返回" 
      @click-left="router.back()"
      right-text="添加" 
      @click-right="showAddForm = true"
    />
    
    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stat-item">
        <div class="stat-value">{{ runningStore.totalDistance.toFixed(1) }}</div>
        <div class="stat-label">总跑量(km)</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ runningStore.records.length }}</div>
        <div class="stat-label">总次数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ runningStore.getAveragePace() }}</div>
        <div class="stat-label">平均配速</div>
      </div>
    </div>
    
    <!-- 记录列表 -->
    <div class="records-list">
      <div v-if="runningStore.records.length === 0" class="empty-state">
        <p>还没有跑步记录</p>
        <van-button type="primary" @click="showAddForm = true">添加记录</van-button>
      </div>
      
      <div 
        v-for="record in runningStore.records" 
        :key="record.id"
        class="record-card"
        @click="showRecordDetail(record)"
      >
        <div class="record-header">
          <div class="record-date">{{ formatDate(record.date) }}</div>
          <div class="record-distance">{{ record.distance.toFixed(1) }} km</div>
        </div>
        <div class="record-details">
          <div class="detail-item">
            <span class="label">时长</span>
            <span class="value">{{ formatDuration(record.duration) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">配速</span>
            <span class="value">{{ record.avgPace }}</span>
          </div>
          <div class="detail-item">
            <span class="label">消耗</span>
            <span class="value">{{ record.calories.toFixed(0) }} kcal</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加记录表单 -->
    <van-popup 
      v-model:show="showAddForm" 
      position="bottom" 
      round
      style="height: 80vh;"
    >
      <div class="add-form">
        <div class="form-header">
          <span>添加跑步记录</span>
          <span @click="showAddForm = false">关闭</span>
        </div>
        
        <van-field
          v-model="newRecord.date"
          label="日期"
          type="date"
          placeholder="选择日期"
        />
        
        <van-field
          v-model="newRecord.distance"
          label="距离(km)"
          type="number"
          placeholder="请输入距离"
        />
        
        <van-field
          label="时长"
          :value="formatTimeDisplay(hours, minutes, seconds)"
          @click="showTimePicker = true"
          readonly
        />
        
        <van-field
          v-model="newRecord.calories"
          label="消耗(kcal)"
          type="number"
          placeholder="请输入消耗热量"
        />
        
        <van-field
          v-model="newRecord.avgPace"
          label="配速"
          placeholder="如：05:30"
        />
        
        <van-field
          v-model="newRecord.avgHeartRate"
          label="平均心率"
          type="number"
          placeholder="请输入平均心率"
        />
        
        <van-field
          v-model="newRecord.avgCadence"
          label="步频(spm)"
          type="number"
          placeholder="请输入步频"
        />
        
        <van-field
          v-model="newRecord.avgStride"
          label="步幅(cm)"
          type="number"
          placeholder="请输入步幅"
        />
        
        <van-field
          v-model="newRecord.notes"
          label="备注"
          type="textarea"
          placeholder="跑步心得..."
          rows="2"
        />
        
        <van-button 
          type="primary" 
          size="large" 
          @click="addRecord"
        >
          保存
        </van-button>
      </div>
    </van-popup>
    
    <!-- 时间选择器 -->
    <van-popup v-model:show="showTimePicker" position="bottom" round>
      <van-datetime-picker
        v-model="timeValue"
        type="time"
        @confirm="handleTimeConfirm"
        @cancel="showTimePicker = false"
        :formatter="formatter"
      />
    </van-popup>
    
    <!-- 记录详情 -->
    <van-popup 
      v-model:show="showDetail" 
      position="bottom" 
      round
      style="height: 60vh;"
    >
      <div v-if="selectedRecord" class="record-detail">
        <div class="detail-header">
          <span>{{ formatDate(selectedRecord.date) }}</span>
          <van-button size="small" type="danger" @click="deleteRecord">删除</van-button>
        </div>
        
        <div class="detail-grid">
          <div class="detail-cell">
            <div class="cell-label">距离</div>
            <div class="cell-value">{{ selectedRecord.distance.toFixed(1) }} km</div>
          </div>
          <div class="detail-cell">
            <div class="cell-label">时长</div>
            <div class="cell-value">{{ formatDuration(selectedRecord.duration) }}</div>
          </div>
          <div class="detail-cell">
            <div class="cell-label">配速</div>
            <div class="cell-value">{{ selectedRecord.avgPace }}</div>
          </div>
          <div class="detail-cell">
            <div class="cell-label">消耗</div>
            <div class="cell-value">{{ selectedRecord.calories.toFixed(0) }} kcal</div>
          </div>
          <div class="detail-cell">
            <div class="cell-label">平均心率</div>
            <div class="cell-value">{{ selectedRecord.avgHeartRate }} bpm</div>
          </div>
          <div class="detail-cell">
            <div class="cell-label">步频</div>
            <div class="cell-value">{{ selectedRecord.avgCadence }} spm</div>
          </div>
          <div class="detail-cell">
            <div class="cell-label">步幅</div>
            <div class="cell-value">{{ selectedRecord.avgStride }} cm</div>
          </div>
          <div class="detail-cell">
            <div class="cell-label">步数</div>
            <div class="cell-value">{{ selectedRecord.steps }}</div>
          </div>
        </div>
        
        <div v-if="selectedRecord.notes" class="detail-notes">
          <div class="notes-label">备注</div>
          <div class="notes-content">{{ selectedRecord.notes }}</div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRunningStore } from '@/store/running'
import { showConfirmDialog, showToast } from 'vant'
import type { RunningRecord } from '@/models/types'

const router = useRouter()
const runningStore = useRunningStore()

const showAddForm = ref(false)
const showDetail = ref(false)
const showTimePicker = ref(false)
const selectedRecord = ref<RunningRecord | null>(null)

const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const timeValue = ref(new Date())

const newRecord = ref({
  date: new Date().toISOString().split('T')[0],
  distance: 0,
  calories: 0,
  avgPace: '',
  avgHeartRate: 0,
  avgCadence: 0,
  avgStride: 0,
  notes: '',
})

onMounted(() => {
  runningStore.init()
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

const formatTimeDisplay = (h: number, m: number, s: number): string => {
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const formatter = (type: string, value: number) => {
  if (type === 'hour') {
    return `${value} 时`
  }
  if (type === 'minute') {
    return `${value} 分`
  }
  if (type === 'second') {
    return `${value} 秒`
  }
  return value
}

const handleTimeConfirm = (value: Date) => {
  hours.value = value.getHours()
  minutes.value = value.getMinutes()
  seconds.value = value.getSeconds()
  showTimePicker.value = false
}

const addRecord = () => {
  if (!newRecord.value.distance || (hours.value === 0 && minutes.value === 0 && seconds.value === 0)) {
    showToast('请填写距离和时长')
    return
  }
  
  const durationInSeconds = hours.value * 3600 + minutes.value * 60 + seconds.value
  const avgSpeed = Number(newRecord.value.distance) / (durationInSeconds / 3600)
  const paceMinutes = durationInSeconds / 60 / Number(newRecord.value.distance)
  const pace = `${Math.floor(paceMinutes).toString().padStart(2, '0')}:${Math.floor((paceMinutes % 1) * 60).toString().padStart(2, '0')}`
  
  runningStore.addRecord({
    date: newRecord.value.date,
    distance: Number(newRecord.value.distance),
    duration: durationInSeconds,
    calories: Number(newRecord.value.calories) || Math.round(Number(newRecord.value.distance) * 60),
    avgPace: newRecord.value.avgPace || pace,
    avgSpeed,
    avgCadence: Number(newRecord.value.avgCadence) || 170 + Math.round(Math.random() * 20),
    avgStride: Number(newRecord.value.avgStride) || 80 + Math.round(Math.random() * 30),
    steps: Math.round(Number(newRecord.value.distance) * 1400),
    avgHeartRate: Number(newRecord.value.avgHeartRate) || 140 + Math.round(Math.random() * 30),
    notes: newRecord.value.notes,
  })
  
  showAddForm.value = false
  showToast('添加成功')
  
  newRecord.value = {
    date: new Date().toISOString().split('T')[0],
    distance: 0,
    calories: 0,
    avgPace: '',
    avgHeartRate: 0,
    avgCadence: 0,
    avgStride: 0,
    notes: '',
  }
  
  hours.value = 0
  minutes.value = 0
  seconds.value = 0
  timeValue.value = new Date()
}

const showRecordDetail = (record: RunningRecord) => {
  selectedRecord.value = record
  showDetail.value = true
}

const deleteRecord = async () => {
  if (!selectedRecord.value) return
  
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这条跑步记录吗？',
    })
    
    runningStore.deleteRecord(selectedRecord.value.id)
    showDetail.value = false
    showToast('删除成功')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.records-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.stats-overview {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  .stat-item {
    text-align: center;
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 12px;
      opacity: 0.9;
    }
  }
}

.records-list {
  padding: 15px;
  
  .empty-state {
    text-align: center;
    padding: 60px 0;
    
    p {
      color: #999;
      margin-bottom: 20px;
    }
  }
  
  .record-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .record-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      
      .record-date {
        font-size: 14px;
        color: #666;
      }
      
      .record-distance {
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
    }
    
    .record-details {
      display: flex;
      justify-content: space-around;
      
      .detail-item {
        text-align: center;
        
        .label {
          font-size: 12px;
          color: #999;
          display: block;
          margin-bottom: 2px;
        }
        
        .value {
          font-size: 14px;
          color: #333;
        }
      }
    }
  }
}

.add-form {
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
  
  .van-button {
    margin-top: 20px;
  }
}

.record-detail {
  padding: 20px;
  
  .detail-header {
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
  }
  
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    
    .detail-cell {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;
      
      .cell-label {
        font-size: 12px;
        color: #999;
        margin-bottom: 4px;
      }
      
      .cell-value {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }
    }
  }
  
  .detail-notes {
    margin-top: 20px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 8px;
    
    .notes-label {
      font-size: 12px;
      color: #999;
      margin-bottom: 8px;
    }
    
    .notes-content {
      font-size: 14px;
      color: #333;
      line-height: 1.5;
    }
  }
}
</style>
