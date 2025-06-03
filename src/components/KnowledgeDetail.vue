<template>
  <div>
    <!-- 知识详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="文件详情"
      width="600px"
    >
      <div v-loading="loading">
        <div v-if="fileDetail" class="knowledge-detail">
          <!-- 文件标题和状态 -->
          <div class="knowledge-detail-header">
            <div class="file-title">
              <el-icon :size="24" class="file-icon">
                <Document />
              </el-icon>
              <h3>{{ fileDetail.name }}</h3>
            </div>
            <el-tag :type="fileDetail.status === 0 ? 'success' : 'warning'">
              {{ fileDetail.status === 0 ? '正常' : '已归档' }}
            </el-tag>
          </div>
          
          <!-- 文件基本信息 -->
          <el-descriptions :column="2" border>
            <el-descriptions-item label="文件ID">{{ fileDetail.id }}</el-descriptions-item>
            <el-descriptions-item label="所属知识集">{{ fileDetail.setId }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ fileDetail.createTime }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ fileDetail.updateTime }}</el-descriptions-item>
            <el-descriptions-item label="当前版本">{{ fileDetail.currentVersion }}</el-descriptions-item>
            <el-descriptions-item label="版本数量">{{ fileDetail.versionCount }}</el-descriptions-item>
          </el-descriptions>
          
          <!-- 文件摘要 -->
          <div class="knowledge-summary" v-if="fileDetail.summary">
            <h4>文件摘要</h4>
            <p>{{ fileDetail.summary }}</p>
          </div>
          
          <!-- 文件标签 -->
          <div class="knowledge-tags" v-if="fileDetail.tagList && fileDetail.tagList.length > 0">
            <h4>标签</h4>
            <div class="tag-list">
              <el-tag
                v-for="(tag, index) in fileDetail.tagList"
                :key="index"
                size="small"
                class="tag-item"
              >{{ tag }}</el-tag>
            </div>
          </div>
          
          <!-- 文件路径 -->
          <div class="knowledge-path">
            <h4>文件路径</h4>
            <el-input
              readonly
              type="textarea"
              :rows="2"
              v-model="fileDetail.content"
            ></el-input>
          </div>
        </div>
        
        <el-empty v-else-if="!loading" description="暂无文件详情"></el-empty>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">关闭</el-button>
          <el-button 
            type="primary" 
            @click="downloadFile"
            :disabled="!fileDetail || !fileDetail.content"
          >下载文件</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getKnowledge } from '@/api/knowledge'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  fileId: {
    type: Number,
    default: 0
  },
  setId: {
    type: Number,
    default: 0
  },
  spaceId: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update:visible', 'close'])

const dialogVisible = ref(props.visible)
const fileDetail = ref<any>(null)
const loading = ref(false)

// 监听对话框可见性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal && props.fileId) {
    loadFileDetail()
  }
})

// 监听对话框内部状态变化并同步到父组件
watch(() => dialogVisible.value, (newVal) => {
  emit('update:visible', newVal)
  if (!newVal) {
    emit('close')
  }
})

// 加载文件详情
const loadFileDetail = () => {
  if (!props.fileId) return
  
  loading.value = true
  fileDetail.value = null
  
  getKnowledge(props.spaceId, props.setId, props.fileId)
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

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
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
</script>

<style scoped>
.knowledge-detail {
  padding: 0 10px;
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

.file-title h3 {
  margin: 0;
  font-size: 18px;
  margin-left: 10px;
}

.knowledge-summary,
.knowledge-tags,
.knowledge-path {
  margin-top: 20px;
}

.knowledge-summary h4,
.knowledge-tags h4,
.knowledge-path h4 {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin-right: 8px;
}
</style> 