<template>
  <div class="prediction-container">
    <van-nav-bar 
      title="赛事预测" 
      left-text="返回" 
      @click-left="router.back()"
    />
    
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="card-header">
        <img 
          :src="userAvatar" 
          alt="用户头像" 
          class="avatar"
        />
        <div class="user-info">
          <h3>{{ userStore.profile?.nickname || '跑者' }}</h3>
          <p>{{ userStore.profile?.age }}岁 · {{ userStore.profile?.gender }}</p>
          <p>{{ userStore.profile?.height }}cm · {{ userStore.profile?.weight }}kg</p>
        </div>
      </div>
      
      <div class="ability-tags" v-if="userStore.profile?.abilityTags?.length">
        <van-tag 
          v-for="tag in userStore.profile?.abilityTags" 
          :key="tag"
          type="primary"
        >
          {{ tag }}
        </van-tag>
      </div>
    </div>
    
    <!-- 跑步数据概览 -->
    <div class="stats-overview">
      <div class="stat-item">
        <div class="stat-value">{{ runningStore.totalDistance.toFixed(1) }}</div>
        <div class="stat-label">总跑量(km)</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ runningStore.records.length }}</div>
        <div class="stat-label">跑步次数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ runningStore.getAveragePace() }}</div>
        <div class="stat-label">平均配速</div>
      </div>
    </div>
    
    <!-- 预测结果 -->
    <div v-if="prediction" class="prediction-result">
      <div class="result-title">
        <h3>🏃 预测成绩</h3>
      </div>
      
      <div class="race-cards">
        <div class="race-card">
          <div class="race-name">半程马拉松</div>
          <div class="race-distance">21.0975 km</div>
          <div class="race-time">{{ prediction.halfMarathon.time }}</div>
          <div class="race-pace">配速: {{ prediction.halfMarathon.pace }}</div>
          <van-tag :type="getConfidenceType(prediction.halfMarathon.confidence)">
            置信度: {{ prediction.halfMarathon.confidence }}
          </van-tag>
        </div>
        
        <div class="race-card">
          <div class="race-name">全程马拉松</div>
          <div class="race-distance">42.195 km</div>
          <div class="race-time">{{ prediction.fullMarathon.time }}</div>
          <div class="race-pace">配速: {{ prediction.fullMarathon.pace }}</div>
          <van-tag :type="getConfidenceType(prediction.fullMarathon.confidence)">
            置信度: {{ prediction.fullMarathon.confidence }}
          </van-tag>
        </div>
      </div>
      
      <div class="advice-section">
        <div class="advice-title">💡 训练建议</div>
        <div class="advice-content">{{ prediction.advice }}</div>
      </div>
      
      <div class="weakness-section">
        <div class="weakness-title">🎯 需要提升的方面</div>
        <div class="weakness-content">{{ prediction.weakness }}</div>
      </div>
    </div>
    
    <!-- 预测按钮 -->
    <div class="action-section">
      <van-button 
        type="primary" 
        size="large" 
        :loading="predicting"
        @click="predict"
      >
        {{ predicting ? '预测中...' : '开始预测' }}
      </van-button>
      
      <van-button 
        v-if="prediction" 
        size="large" 
        @click="prediction = null"
      >
        重新预测
      </van-button>
    </div>
    
    <!-- 无数据提示 -->
    <div v-if="runningStore.records.length === 0" class="empty-state">
      <p>⚠️ 暂无跑步记录，无法进行预测</p>
      <p class="tips">请先添加一些跑步记录，我才能为你提供准确的预测</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useRunningStore } from '@/store/running'
import { qwen } from '@/api/qwen'
import type { RacePrediction } from '@/models/types'

const router = useRouter()
const userStore = useUserStore()
const runningStore = useRunningStore()

const predicting = ref(false)
const prediction = ref<RacePrediction | null>(null)

onMounted(() => {
  userStore.init()
  runningStore.init()
})

const userAvatar = computed(() => {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=running%20avatar%2C%20minimalist%20design%2C%20${userStore.profile?.gender === '女' ? 'female' : 'male'}&image_size=square`
})

const getConfidenceType = (confidence: string) => {
  switch (confidence) {
    case '高':
      return 'success'
    case '中':
      return 'warning'
    case '低':
      return 'danger'
    default:
      return 'default'
  }
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const predict = async () => {
  if (!userStore.profile || runningStore.records.length === 0) {
    return
  }
  
  predicting.value = true
  
  try {
    const result = await qwen.predictRace(
      userStore.profile,
      runningStore.records
    )
    prediction.value = result
  } catch (error) {
    console.error('预测失败:', error)
    // 基于用户实际跑步数据计算预测值
    const avgPace = runningStore.getAveragePace()
    const [min, sec] = avgPace.split(':').map(Number)
    const paceSeconds = min * 60 + sec
    
    // 半马预测（21.0975km）
    const halfMarathonSeconds = paceSeconds * 21.0975
    const halfMarathonTime = formatTime(halfMarathonSeconds)
    
    // 全马预测（42.195km），考虑到疲劳因素，配速增加5%
    const fullMarathonPaceSeconds = paceSeconds * 1.05
    const fullMarathonSeconds = fullMarathonPaceSeconds * 42.195
    const fullMarathonTime = formatTime(fullMarathonSeconds)
    
    // 计算配速
    const halfMarathonPace = avgPace
    const fullMarathonPaceMinutes = Math.floor(fullMarathonPaceSeconds / 60)
    const fullMarathonPaceSecondsRemain = Math.floor(fullMarathonPaceSeconds % 60)
    const fullMarathonPace = `${fullMarathonPaceMinutes.toString().padStart(2, '0')}:${fullMarathonPaceSecondsRemain.toString().padStart(2, '0')}`
    
    prediction.value = {
      halfMarathon: {
        time: halfMarathonTime,
        pace: halfMarathonPace,
        confidence: runningStore.records.length >= 5 ? '中' : '低',
      },
      fullMarathon: {
        time: fullMarathonTime,
        pace: fullMarathonPace,
        confidence: runningStore.records.length >= 5 ? '中' : '低',
      },
      advice: '建议增加轻松跑的比例，打好有氧基础。每周至少进行一次长距离慢跑。',
      weakness: '耐力需要进一步提升，建议增加LSD训练。',
    }
  } finally {
    predicting.value = false
  }
}
</script>

<style scoped lang="scss">
.prediction-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
  
  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-right: 16px;
      border: 3px solid rgba(255, 255, 255, 0.3);
    }
    
    .user-info {
      h3 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      
      p {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 2px;
      }
    }
  }
  
  .ability-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    :deep(.van-tag) {
      background: rgba(255, 255, 255, 0.2);
      border: none;
    }
  }
}

.stats-overview {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background: white;
  margin: -15px 15px 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .stat-item {
    text-align: center;
    
    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #666;
    }
  }
}

.prediction-result {
  margin: 0 15px;
  
  .result-title {
    margin-bottom: 12px;
    
    h3 {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
  }
  
  .race-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
    
    .race-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      .race-name {
        font-size: 14px;
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
      }
      
      .race-distance {
        font-size: 12px;
        color: #999;
        margin-bottom: 8px;
      }
      
      .race-time {
        font-size: 24px;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 4px;
      }
      
      .race-pace {
        font-size: 12px;
        color: #666;
        margin-bottom: 8px;
      }
    }
  }
  
  .advice-section,
  .weakness-section {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .advice-title,
    .weakness-title {
      font-size: 14px;
      font-weight: bold;
      color: #333;
      margin-bottom: 8px;
    }
    
    .advice-content,
    .weakness-content {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }
  }
  
  .weakness-section {
    background: #fff9f0;
    
    .weakness-title {
      color: #ff976a;
    }
  }
}

.action-section {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .van-button {
    margin-bottom: 0;
  }
}

.empty-state {
  margin: 20px 15px;
  background: white;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  
  p {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    
    &.tips {
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
