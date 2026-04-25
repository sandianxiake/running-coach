<template>
  <div class="reset-password-container">
    <van-nav-bar 
      title="重置密码" 
      left-text="返回" 
      @click-left="router.back()"
    />
    
    <div class="reset-password-form">
      <van-field
        v-model="phone"
        label="手机号"
        placeholder="请输入手机号"
        type="tel"
        maxlength="11"
        :rules="[{ required: true, message: '请输入手机号' }]"
      />
      
      <van-field
        v-model="oldPassword"
        label="原密码"
        placeholder="请输入原密码"
        type="password"
        :rules="[{ required: true, message: '请输入原密码' }]"
      />
      
      <van-field
        v-model="newPassword"
        label="新密码"
        placeholder="请输入新密码"
        type="password"
        :rules="[{ required: true, message: '请输入新密码' }]"
      />
      
      <van-field
        v-model="confirmPassword"
        label="确认密码"
        placeholder="请再次输入新密码"
        type="password"
        :rules="[{ validator: validateConfirmPassword, message: '两次输入的密码不一致' }]"
      />
      
      <van-button 
        type="primary" 
        size="large" 
        :disabled="!isFormValid" 
        @click="resetPassword"
      >
        重置密码
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storage } from '@/utils/storage'
import { showToast } from 'vant'

const router = useRouter()

const phone = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const validateConfirmPassword = () => {
  return newPassword.value === confirmPassword.value
}

const isFormValid = computed(() => {
  return !!(
    phone.value && 
    oldPassword.value && 
    newPassword.value && 
    confirmPassword.value &&
    newPassword.value === confirmPassword.value
  )
})

const resetPassword = () => {
  if (!isFormValid.value) return
  
  if (!storage.user.exists(phone.value)) {
    showToast('该手机号未注册')
    return
  }
  
  const success = storage.user.updatePassword(phone.value, oldPassword.value, newPassword.value)
  if (!success) {
    showToast('原密码错误')
    return
  }
  
  showToast('密码重置成功')
  router.push('/')
}
</script>

<style scoped lang="scss">
.reset-password-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.reset-password-form {
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin: 20px;
  
  .van-button {
    margin-top: 24px;
  }
}
</style>
