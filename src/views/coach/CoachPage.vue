<template>
  <div class="coach-container">
    <van-nav-bar 
      title="AI教练" 
      left-text="返回" 
      @click-left="router.back()"
      right-text="清空" 
      @click-right="clearChat"
    />
    
    <!-- 欢迎信息 -->
    <div v-if="messages.length === 0" class="welcome-section">
      <img 
        src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=running%20coach%20AI%20avatar%2C%20friendly%20robot%20coach%2C%20blue%20and%20green%20colors%2C%20minimalist%20design&image_size=square_hd" 
        alt="AI教练" 
        class="coach-avatar"
      />
      <h2>你好，我是小跑 👋</h2>
      <p>你的专属跑步教练，随时为你解答跑步相关的问题</p>
      
      <div class="quick-questions">
        <p>试试问我这些问题：</p>
        <div class="question-tags">
          <van-tag 
            v-for="q in quickQuestions" 
            :key="q"
            type="primary"
            size="large"
            @click="sendQuickQuestion(q)"
          >
            {{ q }}
          </van-tag>
        </div>
      </div>
    </div>
    
    <!-- 聊天消息 -->
    <div v-else ref="messageListRef" class="message-list">
      <div 
        v-for="msg in messages" 
        :key="msg.id"
        class="message-item"
        :class="msg.role"
      >
        <div v-if="msg.role === 'assistant'" class="message-avatar">
          <img 
            src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=running%20coach%20AI%20avatar%2C%20friendly%20robot%20coach%2C%20blue%20and%20green%20colors%2C%20minimalist%20design&image_size=square" 
            alt="AI教练"
          />
        </div>
        <div class="message-content">
          <div class="message-bubble">{{ msg.content }}</div>
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
        <div v-if="msg.role === 'user'" class="message-avatar">
          <img :src="userAvatar" alt="用户" />
        </div>
      </div>
      
      <div v-if="loading" class="message-item assistant">
        <div class="message-avatar">
          <img 
            src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=running%20coach%20AI%20avatar%2C%20friendly%20robot%20coach%2C%20blue%20and%20green%20colors%2C%20minimalist%20design&image_size=square" 
            alt="AI教练"
          />
        </div>
        <div class="message-content">
          <div class="message-bubble loading">
            <van-loading type="spinner" size="16px" />
            <span>思考中...</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-section">
      <van-field
        v-model="inputMessage"
        placeholder="输入你的问题..."
        type="textarea"
        rows="1"
        autosize
        @keyup.enter="sendMessage"
      >
        <template #button>
          <van-button 
            type="primary" 
            size="small" 
            :disabled="!inputMessage.trim() || loading"
            @click="sendMessage"
          >
            发送
          </van-button>
        </template>
      </van-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useRunningStore } from '@/store/running'
import { qwen } from '@/api/qwen'
import { storage } from '@/utils/storage'
import { showConfirmDialog } from 'vant'
import type { ChatMessage } from '@/models/types'

const router = useRouter()
const userStore = useUserStore()
const runningStore = useRunningStore()

const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const loading = ref(false)
const messageListRef = ref<HTMLElement | null>(null)

const quickQuestions = [
  '如何预防跑步膝？',
  '间歇跑应该怎么练？',
  '马拉松赛前一周怎么安排？',
  '跑步后应该吃什么补充？',
]

onMounted(() => {
  userStore.init()
  runningStore.init()
  
  const savedMessages = storage.chat.getAll()
  messages.value = savedMessages
})

const userAvatar = computed(() => {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=running%20avatar%2C%20minimalist%20design%2C%20${userStore.profile?.gender === '女' ? 'female' : 'male'}&image_size=square`
})

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  const content = inputMessage.value.trim()
  if (!content || loading.value) return
  
  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: new Date().toISOString(),
  }
  
  messages.value.push(userMessage)
  storage.chat.add({ role: 'user', content })
  inputMessage.value = ''
  scrollToBottom()
  
  loading.value = true
  
  try {
    const result = await qwen.chatWithCoach(
      content,
      userStore.profile || undefined,
      runningStore.recentRuns,
      messages.value.slice(0, -1)
    )
    
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: result.content,
      timestamp: new Date().toISOString(),
    }
    
    messages.value.push(assistantMessage)
    storage.chat.add({ role: 'assistant', content: result.content })
  } catch (error) {
    console.error('发送消息失败:', error)
    
    const errorMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '抱歉，我遇到了一些问题，请稍后再试。',
      timestamp: new Date().toISOString(),
    }
    
    messages.value.push(errorMessage)
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const sendQuickQuestion = async (question: string) => {
  inputMessage.value = question
  await sendMessage()
}

const clearChat = async () => {
  try {
    await showConfirmDialog({
      title: '确认清空',
      message: '确定要清空所有聊天记录吗？',
    })
    
    storage.chat.clear()
    messages.value = []
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.coach-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.welcome-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  
  .coach-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin-bottom: 20px;
  }
  
  h2 {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: #666;
    text-align: center;
    margin-bottom: 30px;
  }
  
  .quick-questions {
    width: 100%;
    
    p {
      font-size: 14px;
      color: #999;
      margin-bottom: 12px;
    }
    
    .question-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      
      :deep(.van-tag) {
        padding: 8px 16px;
      }
    }
  }
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  
  .message-item {
    display: flex;
    margin-bottom: 16px;
    
    &.user {
      flex-direction: row-reverse;
      
      .message-content {
        align-items: flex-end;
      }
      
      .message-bubble {
        background: #667eea;
        color: white;
      }
    }
    
    &.assistant {
      .message-bubble {
        background: white;
        color: #333;
      }
    }
    
    .message-avatar {
      flex-shrink: 0;
      margin: 0 8px;
      
      img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
      }
    }
    
    .message-content {
      display: flex;
      flex-direction: column;
      max-width: 70%;
      
      .message-bubble {
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
        word-break: break-word;
        
        &.loading {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
      
      .message-time {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }
}

.input-section {
  flex-shrink: 0;
  background: white;
  padding: 10px 15px;
  border-top: 1px solid #f0f0f0;
  
  .van-field {
    background: #f5f5f5;
    border-radius: 20px;
    padding: 8px 12px;
    
    :deep(.van-field__body) {
      align-items: center;
    }
    
    :deep(.van-field__control) {
      font-size: 14px;
    }
  }
}
</style>
