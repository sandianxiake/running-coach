<template>
  <div class="profile-container">
    <van-nav-bar 
      title="注册账号" 
      left-text="返回" 
      @click-left="router.back()"
    />
    
    <div class="profile-form">
      <van-field
        v-model="form.phone"
        label="手机号"
        placeholder="请输入手机号"
        type="tel"
        maxlength="11"
        :rules="[{ required: true, message: '请输入手机号' }]"
      />
      
      <van-field
        v-model="form.password"
        label="密码"
        placeholder="请输入密码（默认123456）"
        type="password"
        :rules="[{ required: true, message: '请输入密码' }]"
      />
      
      <van-field
        v-model="form.nickname"
        label="昵称"
        placeholder="请输入昵称"
        :rules="[{ required: true, message: '请输入昵称' }]"
      />
      
      <van-field
        v-model="form.age"
        label="年龄"
        placeholder="请输入年龄"
        type="number"
        :rules="[{ required: true, message: '请输入年龄' }]"
      />
      
      <van-field label="性别">
        <template #input>
          <van-radio-group v-model="form.gender">
            <van-radio name="男">男</van-radio>
            <van-radio name="女">女</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      
      <van-field
        v-model="form.height"
        label="身高(cm)"
        placeholder="请输入身高"
        type="number"
        :rules="[{ required: true, message: '请输入身高' }]"
      />
      
      <van-field
        v-model="form.weight"
        label="体重(kg)"
        placeholder="请输入体重"
        type="number"
        :rules="[{ required: true, message: '请输入体重' }]"
      />
      
      <van-field label="跑步能力">
        <template #input>
          <div class="ability-tags">
            <van-tag 
              v-for="tag in abilityTags" 
              :key="tag"
              :type="form.abilityTags?.includes(tag) ? 'primary' : 'default'"
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
        :disabled="!isFormValid" 
        @click="register"
      >
        注册
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { storage } from '@/utils/storage'
import type { UserProfile } from '@/models/types'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const abilityTags = ['新手', '初级跑者', '中级跑者', '高级跑者', '马拉松跑者']

const form = ref<Partial<UserProfile>>({
  phone: '',
  password: '123456',
  nickname: '',
  age: 0,
  gender: '男',
  height: 0,
  weight: 0,
  abilityTags: [],
})

const isFormValid = computed(() => {
  return !!(
    form.value.phone && 
    form.value.password && 
    form.value.nickname && 
    form.value.age && 
    form.value.gender && 
    form.value.height && 
    form.value.weight
  )
})

const toggleAbilityTag = (tag: string) => {
  const index = form.value.abilityTags?.indexOf(tag)
  if (index !== undefined && index !== -1) {
    form.value.abilityTags?.splice(index, 1)
  } else {
    form.value.abilityTags?.push(tag)
  }
}

const register = () => {
  if (!isFormValid.value) return
  
  if (storage.user.exists(form.value.phone!)) {
    showToast('该手机号已注册')
    return
  }
  
  userStore.updateProfile({
    phone: form.value.phone!,
    password: form.value.password || '123456',
    nickname: form.value.nickname!,
    age: form.value.age!,
    gender: form.value.gender as '男' | '女',
    height: form.value.height!,
    weight: form.value.weight!,
    abilityTags: form.value.abilityTags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  
  showToast('注册成功')
  router.push('/home')
}
</script>

<style scoped lang="scss">
.profile-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.profile-form {
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin: 20px;
  
  .ability-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .van-button {
    margin-top: 24px;
  }
}
</style>
