<template>
  <div class="message-container">
    <!-- <div class="page-header">
      <h2>用户消息</h2>
    </div> -->

    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">我的消息</div>
          <div class="header-actions">
            <el-button size="small" type="primary" @click="markAllRead">
              <el-icon><Check /></el-icon> 全部标为已读
            </el-button>
            <el-button size="small" @click="deleteAllRead">
              <el-icon><Delete /></el-icon> 清空已读消息
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部消息" name="all">
          <el-skeleton :loading="loading" animated v-if="loading">
            <template #template>
              <div v-for="i in 3" :key="i" style="margin-bottom: 15px;">
                <el-skeleton-item variant="p" style="width: 100%; height: 60px;" />
              </div>
            </template>
          </el-skeleton>
          <message-list v-else :messages="allMessages" @read="handleRead" @delete="handleDelete" />
        </el-tab-pane>
        <el-tab-pane label="未读消息" name="unread">
          <el-skeleton :loading="loading" animated v-if="loading">
            <template #template>
              <div v-for="i in 3" :key="i" style="margin-bottom: 15px;">
                <el-skeleton-item variant="p" style="width: 100%; height: 60px;" />
              </div>
            </template>
          </el-skeleton>
          <message-list v-else :messages="unreadMessages" @read="handleRead" @delete="handleDelete" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Delete } from '@element-plus/icons-vue'
import MessageList from '@/components/message/MessageList.vue'
import messageStore from '@/store/message'
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteAllReadNotifications, deleteNotification, getUnreadNotifications } from '@/api/message'
import type { Message } from '@/store/message'

// 标签页
const activeTab = ref('all')

// 加载状态
const loading = ref(false)
// 分页参数
const pageParams = ref({
  startIndex: 1,
  num: 10
})
// 是否已加载接口数据
const isApiLoaded = ref(false)

// 获取消息列表
const fetchMessages = async () => {
  loading.value = true
  try {
    const response = await getUserNotifications(pageParams.value)
    // axios返回的数据在response.data中
    const res = response.data
    if (res && res.code === 200 && res.data) {
      // 处理API返回的数据格式
      const records = res.data.records || [];
      if (records.length > 0) {
        // 格式化API返回的数据
        const formattedMessages: Message[] = records.map((item: any) => ({
          id: item.id,
          title: `消息通知`,
          content: item.messageContent || '',
          sender: item.senderUsername || '系统',
          sendTime: item.createTime || '',
          isRead: item.isRead === 1,
          type: 'user',
          messageType: item.messageType
        }));
        
        // 更新到store中
        messageStore.messages.value = formattedMessages;
        isApiLoaded.value = true;
      } else {
        // 如果没有数据，保留原有静态数据
        console.log('未获取到消息数据');
      }
    }
  } catch (error) {
    console.error('获取消息列表失败:', error)
    // 接口调用失败时，不更改原有静态数据
  } finally {
    loading.value = false
  }
}

// 获取未读消息列表
const fetchUnreadMessages = async () => {
  if (activeTab.value !== 'unread') return;
  
  loading.value = true;
  try {
    const response = await getUnreadNotifications(pageParams.value);
    const res = response.data;
    if (res && res.code === 200 && res.data) {
      const records = res.data.records || [];
      if (records.length > 0) {
        // 格式化API返回的数据
        const formattedMessages: Message[] = records.map((item: any) => ({
          id: item.id,
          title: `消息通知`,
          content: item.messageContent || '',
          sender: item.senderUsername || '系统',
          sendTime: item.createTime || '',
          isRead: item.isRead === 1,
          type: 'user',
          messageType: item.messageType
        }));
        
        // 更新到store中的未读消息列表
        messageStore.messages.value = formattedMessages;
      } else {
        console.log('没有未读消息');
      }
    }
  } catch (error) {
    console.error('获取未读消息列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 根据不同类型筛选消息
const allMessages = computed(() => {
  return messageStore.messages.value
})

const unreadMessages = computed(() => {
  // 返回未读消息
  return messageStore.messages.value.filter(msg => !msg.isRead)
})

// 标记消息为已读
const handleRead = async (id: number) => {
  try {
    const response = await markNotificationAsRead(id)
    const res = response.data
    // 接口返回code为200且data为"阅读消息成功"表示成功
    if (res && res.code === 200) {
      // 成功后更新本地状态
      messageStore.markAsRead(id)
      ElMessage.success('已标记为已读')
    } else {
      ElMessage.error(res.msg || '标记已读失败')
    }
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  }
}

// 删除消息
const handleDelete = async (id: number) => {
  try {
    const response = await deleteNotification(id)
    const res = response.data
    // 接口返回code为200且data为"删除消息成功！"表示成功
    if (res && res.code === 200) {
      // 成功后更新本地状态
      messageStore.deleteMessage(id)
      ElMessage.success('消息已删除')
      // 如果在全部消息标签页，考虑刷新消息列表
      if (activeTab.value === 'all' && messageStore.messages.value.length === 0) {
        fetchMessages()
      }
    } else {
      ElMessage.error(res.msg || '删除消息失败')
    }
  } catch (error) {
    console.error('删除消息失败:', error)
    ElMessage.error('删除消息失败')
  }
}

// 标记所有为已读
const markAllRead = async () => {
  try {
    const response = await markAllNotificationsAsRead()
    const res = response.data
    // 接口返回code为200且data为"阅读所有未读消息成功"表示成功
    if (res && res.code === 200) {
      // 成功后更新本地状态
      messageStore.markAllAsRead()
      ElMessage.success('全部标记为已读')
      // 刷新全部消息列表
      if (activeTab.value === 'all') {
        fetchMessages()
      } else {
        // 如果在未读消息标签页，清空未读列表
        messageStore.messages.value = messageStore.messages.value.filter(msg => msg.isRead)
      }
    } else {
      ElMessage.error(res.msg || '标记全部已读失败')
    }
  } catch (error) {
    console.error('标记全部已读失败:', error)
    ElMessage.error('标记全部已读失败')
  }
}

// 清空已读消息
const deleteAllRead = async () => {
  try {
    const response = await deleteAllReadNotifications()
    const res = response.data
    // 接口返回code为0且data为"删除已读消息成功！"表示成功
    if (res && res.code === 0) {
      // 成功后更新本地状态
      const readMessages = messageStore.messages.value.filter(msg => msg.isRead)
      readMessages.forEach(msg => {
        messageStore.deleteMessage(msg.id)
      })
      ElMessage.success('已清空已读消息')
      // 如果在全部消息标签页，刷新消息列表
      if (activeTab.value === 'all') {
        fetchMessages()
      }
    } else {
      ElMessage.error(res.msg || '清空已读消息失败')
    }
  } catch (error) {
    console.error('清空已读消息失败:', error)
    ElMessage.error('清空已读消息失败')
  }
}

// 监听标签页切换
const handleTabChange = (tab: string) => {
  if (tab === 'unread') {
    fetchUnreadMessages();
  } else if (tab === 'all') {
    fetchMessages();
  }
};

// 组件挂载时，如果从通知栏点击进入，自动切换到未读消息标签
onMounted(() => {
  // 加载消息数据
  fetchMessages()
  
  const hasUnread = messageStore.unreadCount.value > 0
  if (hasUnread) {
    activeTab.value = 'unread'
    fetchUnreadMessages()
  }
})
</script>

<style scoped>
.message-container {
  padding: 0;
}

/* .page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
} */

.page-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 500;
}

.main-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style>