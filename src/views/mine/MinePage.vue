<template>
  <div class="mine-container">
    <van-nav-bar 
      title="个人中心" 
      left-text="返回" 
      @click-left="router.back()"
    />
    
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <img :src="userAvatar" alt="用户头像" class="avatar" />
      <div class="user-info">
        <h2>{{ userStore.profile?.nickname || '跑者' }}</h2>
        <p>{{ userStore.profile?.phone }}</p>
      </div>
      <van-button size="small" @click="editProfile">编辑资料</van-button>
    </div>
    
    <!-- 数据统计 -->
    <div class="stats-section">
      <div class="stat-item">
        <div class="stat-value">{{ runningStore.totalDistance.toFixed(1) }}</div>
        <div class="stat-label">总跑量(km)</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ runningStore.records.length }}</div>
        <div class="stat-label">跑步次数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ runningStore.totalCalories.toFixed(0) }}</div>
        <div class="stat-label">总消耗(kcal)</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ planStore.activePlans.length }}</div>
        <div class="stat-label">进行中计划</div>
      </div>
    </div>
    
    <!-- 功能菜单 -->
    <div class="menu-section">
      <van-cell-group>
        <van-cell 
          title="完善个人资料" 
          is-link 
          @click="editProfile"
        >
          <template #icon>
            <van-icon name="user-o" class="menu-icon" />
          </template>
        </van-cell>
        <van-cell 
          title="修改密码" 
          is-link 
          @click="goToResetPassword"
        >
          <template #icon>
            <van-icon name="lock" class="menu-icon" />
          </template>
        </van-cell>
        <van-cell 
          title="跑步记录" 
          is-link 
          @click="goToRecords"
        >
          <template #icon>
            <van-icon name="orders-o" class="menu-icon" />
          </template>
        </van-cell>
        <van-cell 
          title="训练计划" 
          is-link 
          @click="goToPlans"
        >
          <template #icon>
            <van-icon name="todo-list-o" class="menu-icon" />
          </template>
        </van-cell>
        <van-cell 
          title="赛事预测" 
          is-link 
          @click="goToPrediction"
        >
          <template #icon>
            <van-icon name="chart-trending-o" class="menu-icon" />
          </template>
        </van-cell>
        <van-cell 
          title="AI教练" 
          is-link 
          @click="goToCoach"
        >
          <template #icon>
            <van-icon name="chat-o" class="menu-icon" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    
    <!-- 关于我们 -->
    <div class="about-section">
      <van-cell-group>
        <van-cell title="关于我们" is-link @click="showAbout">
          <template #icon>
            <van-icon name="info-o" class="menu-icon" />
          </template>
        </van-cell>
        <van-cell title="清除缓存" is-link @click="clearCache">
          <template #icon>
            <van-icon name="delete-o" class="menu-icon" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    
    <!-- 退出登录 -->
    <div class="logout-section">
      <van-button 
        type="danger" 
        size="large" 
        round 
        @click="logout"
      >
        退出登录
      </van-button>
    </div>
    
    <!-- 版本信息 -->
    <div class="version-info">
      <p>跑步教练 v1.0.0</p>
      <p>Powered by 通义千问</p>
    </div>
    
    <!-- 编辑资料弹窗 -->
    <van-popup 
      v-model:show="showEditProfile" 
      position="bottom" 
      round
      style="height: 70vh;"
    >
      <div class="edit-form">
        <div class="form-header">
          <span>编辑资料</span>
          <span @click="showEditProfile = false">关闭</span>
        </div>
        
        <van-field
          v-model="editForm.nickname"
          label="昵称"
          placeholder="请输入昵称"
        />
        
        <van-field
          v-model="editForm.age"
          label="年龄"
          type="number"
          placeholder="请输入年龄"
        />
        
        <van-field label="性别">
          <template #input>
            <van-radio-group v-model="editForm.gender">
              <van-radio name="男">男</van-radio>
              <van-radio name="女">女</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        
        <van-field
          v-model="editForm.height"
          label="身高(cm)"
          type="number"
          placeholder="请输入身高"
        />
        
        <van-field
          v-model="editForm.weight"
          label="体重(kg)"
          type="number"
          placeholder="请输入体重"
        />
        
        <van-field label="跑步能力">
          <template #input>
            <div class="ability-tags">
              <van-tag 
                v-for="tag in abilityTags" 
                :key="tag"
                :type="editForm.abilityTags.includes(tag) ? 'primary' : 'default'"
                @click="toggleAbilityTag(tag)"
              >
                {{ tag }}
              </van-tag>
            </div>
          </template>
        </van-field>
        
        <van-button 
          type="primary" 
          size="large" 
          @click="saveProfile"
        >
          保存
        </van-button>
      </div>
    </van-popup>
    
    <!-- 关于弹窗 -->
    <van-dialog 
      v-model:show="showAboutDialog" 
      title="关于我们" 
      :show-confirm-button="true"
      confirm-button-text="我知道了"
    >
      <div class="about-content">
        <p>跑步教练是一款智能跑步助手应用</p>
        <p>为你提供专业的训练指导</p>
        <p>集成AI教练功能，随时解答跑步问题</p>
        <p class="mt-10">版本: v1.0.0</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useRunningStore } from '@/store/running'
import { usePlanStore } from '@/store/plan'
import { showConfirmDialog, showToast } from 'vant'
import type { UserProfile } from '@/models/types'

const router = useRouter()
const userStore = useUserStore()
const runningStore = useRunningStore()
const planStore = usePlanStore()

const showEditProfile = ref(false)
const showAboutDialog = ref(false)

const abilityTags = ['新手', '初级跑者', '中级跑者', '高级跑者', '马拉松跑者']

const editForm = ref({
  nickname: '',
  age: 0,
  gender: '男' as '男' | '女',
  height: 0,
  weight: 0,
  abilityTags: [] as string[],
})

onMounted(() => {
  userStore.init()
  runningStore.init()
  planStore.init()
  
  if (userStore.profile) {
    editForm.value = { ...userStore.profile }
  }
})

const userAvatar = computed(() => {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=running%20avatar%2C%20minimalist%20design%2C%20${userStore.profile?.gender === '女' ? 'female' : 'male'}&image_size=square`
})

const editProfile = () => {
  if (userStore.profile) {
    editForm.value = { ...userStore.profile }
  }
  showEditProfile.value = true
}

const toggleAbilityTag = (tag: string) => {
  const index = editForm.value.abilityTags.indexOf(tag)
  if (index !== -1) {
    editForm.value.abilityTags.splice(index, 1)
  } else {
    editForm.value.abilityTags.push(tag)
  }
}

const saveProfile = () => {
  userStore.updateProfile({
    nickname: editForm.value.nickname,
    age: editForm.value.age,
    gender: editForm.value.gender,
    height: editForm.value.height,
    weight: editForm.value.weight,
    abilityTags: editForm.value.abilityTags,
  } as Partial<UserProfile>)
  
  showEditProfile.value = false
  showToast('保存成功')
}

const goToResetPassword = () => {
  router.push('/reset-password')
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

const showAbout = () => {
  showAboutDialog.value = true
}

const clearCache = async () => {
  try {
    await showConfirmDialog({
      title: '确认清除',
      message: '确定要清除所有缓存数据吗？',
    })
    
    localStorage.clear()
    showToast('缓存已清除')
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch {
    // 用户取消
  }
}

const logout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？',
    })
    
    userStore.clearProfile()
    router.push('/')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.mine-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 30px;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 20px;
  color: white;
  display: flex;
  align-items: center;
  
  .avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    margin-right: 16px;
    border: 3px solid rgba(255, 255, 255, 0.3);
  }
  
  .user-info {
    flex: 1;
    
    h2 {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    p {
      font-size: 14px;
      opacity: 0.9;
    }
  }
  
  :deep(.van-button) {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
  }
}

.stats-section {
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
      font-size: 18px;
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

.menu-section,
.about-section {
  margin: 15px;
  
  .menu-icon {
    margin-right: 8px;
    font-size: 18px;
    color: #667eea;
  }
}

.logout-section {
  margin: 30px 15px 0;
}

.version-info {
  text-align: center;
  margin-top: 20px;
  
  p {
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
  }
}

.edit-form {
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
  
  .ability-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .van-button {
    margin-top: 20px;
  }
}

.about-content {
  padding: 20px;
  text-align: center;
  
  p {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    
    &.mt-10 {
      margin-top: 20px;
      color: #999;
    }
  }
}
</style>
