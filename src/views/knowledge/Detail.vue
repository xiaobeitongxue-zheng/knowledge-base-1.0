<template>
  <div class="knowledge-detail-page">
    <div class="page-header">
      <el-page-header @back="goBack" :title="'返回'" :content="fileDetail?.name || '文件详情'" />
    </div>
    
    <div class="page-content" v-loading="loading">
      <div v-if="fileDetail" class="knowledge-detail">
        <!-- 文件标题和状态 -->
        <div class="knowledge-detail-header">
          <div class="file-title">
            <el-icon :size="28" class="file-icon">
              <Document />
            </el-icon>
            <h2>{{ fileDetail.name }}</h2>
          </div>
          <el-tag :type="fileDetail.status === 0 ? 'success' : 'warning'" size="large">
            {{ fileDetail.status === 0 ? '正常' : '已归档' }}
          </el-tag>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="downloadFile">
            <el-icon><Download /></el-icon> 下载文件
          </el-button>
          <el-button>
            <el-icon><Edit /></el-icon> 编辑
          </el-button>
          <el-button>
            <el-icon><Share /></el-icon> 分享
          </el-button>
        </div>
        
        <!-- 文件基本信息 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="文件ID">{{ fileDetail.id }}</el-descriptions-item>
            <el-descriptions-item label="所属知识集">{{ fileDetail.setId }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ fileDetail.createTime }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ fileDetail.updateTime }}</el-descriptions-item>
            <el-descriptions-item label="当前版本">{{ fileDetail.currentVersion }}</el-descriptions-item>
            <el-descriptions-item label="版本数量">{{ fileDetail.versionCount }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 文件摘要 -->
        <el-card class="detail-card" v-if="fileDetail.summary">
          <template #header>
            <div class="card-header">
              <span>文件摘要</span>
            </div>
          </template>
          
          <div class="summary-content">
            <p>{{ fileDetail.summary }}</p>
          </div>
        </el-card>
        
        <!-- 文件标签 -->
        <el-card class="detail-card" v-if="fileDetail.tagList && fileDetail.tagList.length > 0">
          <template #header>
            <div class="card-header">
              <span>标签</span>
            </div>
          </template>
          
          <div class="tag-list">
            <el-tag
              v-for="(tag, index) in fileDetail.tagList"
              :key="index"
              size="large"
              class="tag-item"
            >{{ tag }}</el-tag>
          </div>
        </el-card>
        
        <!-- 文件路径 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span>文件路径</span>
            </div>
          </template>
          
          <div class="file-path">
            <el-input
              readonly
              type="textarea"
              :rows="2"
              v-model="fileDetail.content"
            ></el-input>
            
            <el-button 
              text 
              type="primary" 
              class="copy-button"
              @click="copyFilePath"
            >
              <el-icon><CopyDocument /></el-icon> 复制路径
            </el-button>
          </div>
        </el-card>
      </div>
      
      <el-empty v-else-if="!loading" description="暂无文件详情"></el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, Download, Edit, Share, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getKnowledge } from '@/api/knowledge'

const route = useRoute()
const router = useRouter()

const fileDetail = ref<any>(null)
const loading = ref(false)

// 在组件挂载时加载文件详情
onMounted(() => {
  const { spaceId = 1, setId, knowledgeId } = route.params
  
  if (setId && knowledgeId) {
    loadFileDetail(Number(spaceId), Number(setId), Number(knowledgeId))
  } else {
    ElMessage.error('缺少必要的参数')
  }
})

// 加载文件详情
const loadFileDetail = (spaceId: number, setId: number, knowledgeId: number) => {
  loading.value = true
  fileDetail.value = null
  
  getKnowledge(spaceId, setId, knowledgeId)
    .then(response => {
      if (response.data && response.data.code === 200) {
        fileDetail.value = response.data.data
        console.log('文件详情:', fileDetail.value)
      } else {
        ElMessage.error(`获取文件详情失败: ${response.data?.message || '未知错误'}`)
      }
    })
    .catch(error => {
      console.error('获取文件详情失败:', error)
      ElMessage.error(`获取文件详情失败: ${error.message || '未知错误'}`)
    })
    .finally(() => {
      loading.value = false
    })
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 下载文件
const downloadFile = () => {
  if (!fileDetail.value || !fileDetail.value.content) {
    ElMessage.warning('文件路径不存在，无法下载')
    return
  }
  
  const filePath = fileDetail.value.content
  ElMessage.success('开始下载文件: ' + fileDetail.value.name)
  
  // 实际开发中应该调用下载API
  // 例如: window.open(`/api/file/download?path=${encodeURIComponent(filePath)}`)
}

// 复制文件路径
const copyFilePath = () => {
  if (!fileDetail.value || !fileDetail.value.content) {
    ElMessage.warning('文件路径不存在')
    return
  }
  
  // 复制文本到剪贴板
  navigator.clipboard.writeText(fileDetail.value.content)
    .then(() => {
      ElMessage.success('文件路径已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}
</script>

<style scoped>
.knowledge-detail-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.knowledge-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.file-title {
  display: flex;
  align-items: center;
}

.file-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  margin-left: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-content {
  line-height: 1.6;
  color: #303133;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  margin-bottom: 5px;
}

.file-path {
  position: relative;
}

.copy-button {
  position: absolute;
  right: 10px;
  top: 10px;
}
</style> 