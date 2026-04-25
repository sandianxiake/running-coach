<template>
  <div class="welcome-container">
    <div class="welcome-content">
      <div class="logo">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=running%20coach%20logo%20with%20running%20figure%20and%20AI%20elements%2C%20minimalist%20design%2C%20blue%20and%20green%20colors&image_size=square_hd" alt="跑步教练" />
        <h1>跑步教练</h1>
        <p>智能跑步助手，为你提供专业的训练指导</p>
      </div>
      
      <div class="auth-section">
        <van-field
          v-model="phone"
          label=""
          placeholder="请输入手机号"
          type="tel"
          maxlength="11"
          :rules="[{ required: true, message: '请输入手机号' }]"
        />
        <van-field
          v-model="password"
          label=""
          placeholder="请输入密码"
          type="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
        <van-button 
          type="primary" 
          size="large" 
          :disabled="!phone || !password" 
          @click="login"
        >
          登录
        </van-button>
        <div class="auth-actions">
          <span @click="goToResetPassword">忘记密码？</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { storage } from '@/utils/storage'
import { showToast } from 'vant'
import type { UserProfile } from '@/models/types'

const router = useRouter()
const userStore = useUserStore()

const phone = ref('')
const password = ref('')

const login = () => {
  const userExists = storage.user.exists(phone.value)
  
  if (!userExists) {
    // 首次登录，自动注册
    const newUser: UserProfile = {
      phone: phone.value,
      password: '123456', // 固定使用默认密码
      nickname: `跑者${phone.value.slice(-4)}`,
      age: 25,
      gender: '男',
      height: 170,
      weight: 60,
      abilityTags: ['新手'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    storage.user.set(newUser)
    showToast('注册成功，默认密码：123456')
  } else {
    // 已有用户，验证密码
    const isValid = storage.user.verifyPassword(phone.value, password.value)
    if (!isValid) {
      showToast('密码错误')
      return
    }
  }
  
  userStore.init()
  router.push('/home')
}

const goToResetPassword = () => {
  router.push('/reset-password')
}
</script>

<style scoped lang="scss">
.welcome-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.welcome-content {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.logo {
  text-align: center;
  margin-bottom: 30px;
  
  img {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    margin-bottom: 16px;
  }
  
  h1 {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #333;
  }
  
  p {
    font-size: 14px;
    color: #666;
  }
}

.auth-section {
  .van-field {
    margin-bottom: 16px;
  }
  
  .van-button {
    margin-top: 20px;
  }

  .auth-actions {
    display: flex;
    justify-content: center;
    margin-top: 16px;
    
    span {
      color: #667eea;
      font-size: 14px;
    }
  }
}
</style>
