<template>
  <div class="home-container">
    <van-nav-bar 
      title="跑步教练" 
      right-text="设置" 
      @click-right="goToMine"
    />
    
    <!-- 用户信息 -->
    <div class="user-info">
      <img 
        :src="userAvatar" 
        alt="用户头像" 
        class="avatar"
      />
      <div class="user-details">
        <h2>{{ userStore.profile?.nickname || '跑者' }}</h2>
        <p class="user-stats">{{ userStore.profile?.age }}岁 · {{ userStore.profile?.gender }}</p>
      </div>
    </div>
    
    <!-- 数据概览 -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-value">{{ runningStore.totalDistance.toFixed(1) }}</div>
        <div class="stat-label">总跑量(km)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ formatDuration(runningStore.totalDuration) }}</div>
        <div class="stat-label">总时长</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ runningStore.totalCalories.toFixed(0) }}</div>
        <div class="stat-label">总消耗(kcal)</div>
      </div>
    </div>
    
    <!-- 快捷功能 -->
    <div class="quick-actions">
      <div class="action-card" @click="goToRecords">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=running%20records%20icon%2C%20minimalist%20design%2C%20blue%20color&image_size=square" alt="跑步记录" />
        <span>跑步记录</span>
      </div>
      <div class="action-card" @click="goToPlans">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=training%20plan%20icon%2C%20minimalist%20design%2C%20green%20color&image_size=square" alt="训练计划" />
        <span>训练计划</span>
      </div>
      <div class="action-card" @click="goToPrediction">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=race%20prediction%20icon%2C%20minimalist%20design%2C%20purple%20color&image_size=square" alt="赛事预测" />
        <span>赛事预测</span>
      </div>
      <div class="action-card" @click="goToCoach">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20coach%20icon%2C%20minimalist%20design%2C%20orange%20color&image_size=square" alt="AI教练" />
        <span>AI教练</span>
      </div>
    </div>
    
    <!-- 最近跑步 -->
    <div class="recent-runs">
      <div class="section-title">
        <h3>最近跑步</h3>
        <span @click="goToRecords" class="more">查看更多</span>
      </div>
      
      <div v-if="runningStore.recentRuns.length === 0" class="empty-state">
        <p>还没有跑步记录</p>
        <van-button type="primary" size="small" @click="goToRecords">添加记录</van-button>
      </div>
      
      <div v-else class="run-list">
        <div 
          v-for="run in runningStore.recentRuns.slice(0, 3)" 
          :key="run.id"
          class="run-item"
        >
          <div class="run-info">
            <div class="run-date">{{ formatDate(run.date) }}</div>
            <div class="run-distance">{{ run.distance.toFixed(1) }}km</div>
          </div>
          <div class="run-details">
            <div class="detail-item">
              <span class="detail-label">配速</span>
              <span class="detail-value">{{ run.avgPace }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">时长</span>
              <span class="detail-value">{{ formatDuration(run.duration) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">消耗</span>
              <span class="detail-value">{{ run.calories.toFixed(0) }}kcal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useRunningStore } from '@/store/running'

const router = useRouter()
const userStore = useUserStore()
const runningStore = useRunningStore()

const userAvatar = computed(() => {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=running%20avatar%2C%20minimalist%20design%2C%20${userStore.profile?.gender === '女' ? 'female' : 'male'}&image_size=square`
})

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const goToRecords = () => {
  router.push('/records')
}

const goToPlans = () => {
  router.push('/plans')
}

const goToPrediction = () => {
  router.push('/prediction')
}

const goToCoach = () => {
  router.push('/coach')
}

const goToMine = () => {
  router.push('/mine')
}

// 初始化数据
userStore.init()
runningStore.init()
</script>

<style scoped lang="scss">
.home-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-right: 16px;
  }
  
  .user-details {
    h2 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .user-stats {
      font-size: 14px;
      opacity: 0.9;
    }
  }
}

.stats-container {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background: white;
  margin: -15px 15px 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .stat-card {
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

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 0 15px;
  margin-bottom: 20px;
  
  .action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    padding: 16px 8px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    img {
      width: 40px;
      height: 40px;
      margin-bottom: 8px;
    }
    
    span {
      font-size: 12px;
      color: #333;
    }
  }
}

.recent-runs {
  background: white;
  margin: 0 15px 20px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h3 {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    
    .more {
      font-size: 14px;
      color: #667eea;
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 30px 0;
    
    p {
      color: #999;
      margin-bottom: 16px;
    }
  }
  
  .run-list {
    .run-item {
      border-bottom: 1px solid #f0f0f0;
      padding: 12px 0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .run-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        
        .run-date {
          font-size: 14px;
          color: #666;
        }
        
        .run-distance {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
      }
      
      .run-details {
        display: flex;
        justify-content: space-around;
        
        .detail-item {
          text-align: center;
          
          .detail-label {
            font-size: 12px;
            color: #999;
            display: block;
            margin-bottom: 2px;
          }
          
          .detail-value {
            font-size: 14px;
            color: #333;
          }
        }
      }
    }
  }
}
</style>
