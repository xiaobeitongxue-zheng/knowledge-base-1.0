<template>
  <div class="personal-knowledge-base">
    <!-- 顶部导航 -->
    <div class="top-navbar">
      <div class="logo-section">
        <h2>个人知识库</h2>
      </div>
      <div class="navigation-tabs">
        <el-menu mode="horizontal" :default-active="activeTab" @select="handleTabChange">
          <el-menu-item index="dashboard">工作台</el-menu-item>
          <el-menu-item index="documents">知识管理</el-menu-item>
          <el-menu-item index="sharing">我的分享</el-menu-item>
          <el-menu-item index="favorite">我的收藏</el-menu-item>
        </el-menu>
      </div>
    </div>
  
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 工作台页面 -->
      <div v-if="activeTab === 'dashboard'" class="dashboard-view">

        <!-- 快捷入口和数据看板 -->
        <el-row :gutter="20" class="dashboard-grid">
          <!-- 左侧快捷入口 -->
          <el-col :span="16">
            <el-card class="quick-access-panel">
              <!-- 最近编辑/访问的文档 -->
              <div class="section recent-docs">
                <div class="section-header">
                  <h4>最近编辑/访问</h4>
                  <!-- <el-button text @click="goToAllKnowledge">查看全部</el-button> -->
                </div>
                <el-scrollbar height="150px">
                  <div class="doc-list">
                    <div v-for="doc in recentDocuments" :key="doc.id" class="doc-item" @click="openDocument(doc)">
                      <el-avatar :size="40" :icon="getFileIcon(doc.type)" />
                      <div class="doc-info">
                        <span class="doc-title">{{ doc.title }}</span>
                        <span class="doc-meta">{{ formatDate(doc.lastModified) }} 编辑</span>
                      </div>
                    </div>
                  </div>
                </el-scrollbar>
              </div>
              
              <!-- 待办学习任务 -->
              <div class="section pending-tasks">
                <div class="section-header">
                  <h4>待办学习任务</h4>
                  <!-- <el-button text>查看全部</el-button> -->
                </div>
                <el-scrollbar height="150px">
                  <div class="task-list">
                    <div v-for="task in pendingTasks" :key="task.id" class="task-item">
                      <el-checkbox v-model="task.completed" @change="updateTaskStatus(task)">
                        {{ task.title }}
                      </el-checkbox>
                      <span class="task-due" :class="{ overdue: isOverdue(task.dueDate) }">
                        {{ formatDueDate(task.dueDate) }}
                      </span>
                    </div>
                  </div>
                </el-scrollbar>
              </div>
              
              <!-- 收藏的常用知识 -->
              <div class="section favorite-docs">
                <div class="section-header">
                  <h4>收藏的常用知识</h4>
                  <!-- <el-button text @click="showManageFavorites">管理收藏</el-button> -->
                </div>
                <el-scrollbar height="250px">
                  <div class="favorite-grid">
                    <div v-for="doc in favoriteDocuments" :key="doc.id" class="favorite-item" @click="openDocument(doc)">
                      <el-avatar shape="square" :size="50" :icon="getFileIcon(doc.type)" />
                      <span class="favorite-title">{{ doc.title }}</span>
                    </div>
                  </div>
                </el-scrollbar>
              </div>
            </el-card>
          </el-col>
        
          <!-- 右侧数据看板 -->
          <el-col :span="8">
            <el-card class="statistics-panel">
              <template #header>
                <div class="card-header">
                  <h3>数据统计</h3>
                  <el-radio-group v-model="statsTimeRange" size="small">
                    <el-radio-button label="week">本周</el-radio-button>
                    <el-radio-button label="month">本月</el-radio-button>
                  </el-radio-group>
                </div>
              </template>
              
              <!-- 知识贡献量统计 -->
              <div class="stats-section">
                <h4>知识贡献量</h4>
                <div class="contribution-chart" ref="contributionChart"></div>
                <div class="stats-summary">
                  <div class="stats-item">
                    <span class="stats-value">{{ contributionStats.uploaded }}</span>
                    <span class="stats-label">上传文档</span>
                  </div>
                  <div class="stats-item">
                    <span class="stats-value">{{ contributionStats.edited }}</span>
                    <span class="stats-label">编辑文档</span>
                  </div>
                  <div class="stats-item">
                    <span class="stats-value">{{ contributionStats.shared }}</span>
                    <span class="stats-label">分享文档</span>
                  </div>
                </div>
              </div>
              
              <!-- 学习进度统计 -->
              <div class="stats-section">
                <h4>代办任务统计</h4>
                <div class="learning-progress">
                  <el-progress 
                    type="dashboard" 
                    :percentage="learningStats.completionRate" 
                    :color="getProgressColor"
                  />
                  <div class="progress-info">
                    <div class="progress-item">
                      <div class="progress-label">已完成</div>
                      <div class="progress-value">{{ learningStats.completed }}</div>
                    </div>
                    <div class="progress-item">
                      <div class="progress-label">未完成</div>
                      <div class="progress-value">{{ learningStats.pending }}</div>
                    </div>
                    <el-button type="primary" size="small" class="create-plan-btn" @click="showCreateLearningPlan">
                      <el-icon><Plus /></el-icon>
                      学习任务
                    </el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
  
      <!-- 知识管理页面 -->
      <div v-if="activeTab === 'documents'" class="documents-view">
        <!-- 文档筛选区域 -->
        <div class="filter-section">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索知识..."
                :prefix-icon="Search"
                clearable
                @keyup.enter="searchDocuments"
              />
            </el-col>
          </el-row>
        </div>
  
        <!-- 文件路径导航 -->
        <div class="file-path-nav">
          <div class="path-nav-container">
            <el-button 
              v-if="currentPath.length > 0 && !isSearchMode" 
              size="small" 
              icon="ArrowLeft" 
              @click="navigateBack" 
              class="back-button"
            >
              返回上一页
            </el-button>
            <el-button
              v-if="isSearchMode"
              size="small"
              icon="Back"
              @click="isSearchMode = false; searchKeyword = ''; searchResultInfo = '';"
              class="back-button"
            >
              返回文件列表
            </el-button>
            <el-breadcrumb separator="/" v-if="!isSearchMode">
              <el-breadcrumb-item :to="{ path: '' }" @click="navigateToRoot">全部知识库</el-breadcrumb-item>
              <el-breadcrumb-item 
                v-for="(folder, index) in currentPath" 
                :key="index"
                :to="{ path: '' }"
                @click="navigateToPath(index)"
              >
                {{ folder.name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
            <div v-if="isSearchMode" class="search-result-info">
              <span>{{ searchResultInfo }}</span>
            </div>
            
            <div class="path-actions">
              <el-button 
                v-if="currentPath.length === 0"
                size="small" 
                @click="createNewFolder"
              >
                <el-icon><FolderAdd /></el-icon> 新建知识库
              </el-button>
              
              <!-- 在知识库内显示新建知识和上传文档按钮 -->
              <template v-if="currentPath.length > 0 && !isSearchMode">
                <el-button 
                  size="small" 
                  @click="uploadDialogVisible = true"
                >
                  <el-icon><Upload /></el-icon> 上传文档
                </el-button>
                <el-button 
                  size="small" 
                  @click="showNewKnowledgeDialog"
                >
                  <el-icon><DocumentAdd /></el-icon> 新建知识
                </el-button>
              </template>
            </div>
          </div>
        </div>
        
        <!-- 表格视图 -->
        <el-table
          v-if="viewMode === 'table'"
          :data="currentLocationDocuments"
          style="width: 100%"
          v-loading="loading"
          @row-click="handleRowClick"
          header-align="center" 
          :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266', fontWeight: 'bold' }" 
          :cell-style="{ textAlign: 'center' }" 
          :fit="true"
          :border="false"
        >
          <template #empty>
            <el-empty :description="currentPath.length === 0 ? '暂无文件夹' : '暂无文档'" />
          </template>
          
          <!-- 名称列 (始终显示) -->
          <el-table-column label="名称" min-width="180" align="left" header-align="left">
            <template #header>
              <span style="text-align: left; display: block; padding-left: 10px;">名称</span>
            </template>
            <template #default="scope">
              <div class="file-name-cell" style="display: flex; align-items: center; justify-content: flex-start;">
                <el-icon :size="18" class="file-icon" style="margin-right: 8px;">
                  <component :is="getFileTypeIcon(scope.row.type)"></component>
                </el-icon>
                <span 
                  :class="{ 'folder-name': scope.row.isFolder }"
                  @click.stop="scope.row.isFolder ? enterFolder(scope.row) : null"
                >{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          
          <!-- 创建日期列 (非搜索模式显示) -->
          <el-table-column v-if="!isSearchMode" label="创建日期" width="150" align="center" header-align="center">
            <template #header>
              <span style="text-align: center; display: block;">创建日期</span>
            </template>
            <template #default="scope">
              <div style="text-align: center;">{{ scope.row.createTime ? formatDate(new Date(scope.row.createTime), 'short') : '-' }}</div>
            </template>
          </el-table-column>
          
          <!-- 摘要列 (所有模式都显示) -->
          <el-table-column 
            v-if="currentLocationDocuments.some(doc => !doc.isFolder)"
            label="知识摘要" 
            :width="isSearchMode ? 150 : 120"
            align="center" 
            header-align="center"
          >
            <template #header>
              <span style="text-align: center; display: block;">知识摘要</span>
            </template>
            <template #default="scope">
              <div style="text-align: center;">
                <el-button 
                  v-if="!scope.row.isFolder && scope.row.summary" 
                  link 
                  type="primary" 
                  @click.stop="showKnowledgeSummary(scope.row)"
                >
                  查看摘要
                </el-button>
                <span v-else>-</span>
              </div>
            </template>
          </el-table-column>
          
          <!-- 状态列 (非搜索模式显示) -->
          <el-table-column v-if="!isSearchMode && currentLocationDocuments.some(doc => !doc.isFolder)" label="状态" width="100" align="center" header-align="center">
            <template #header>
              <span style="text-align: center; display: block;">状态</span>
            </template>
            <template #default="scope">
              <div style="text-align: center;">
                <template v-if="!scope.row.isFolder">
                  <el-tag 
                    :type="scope.row.status === 0 ? 'success' : 'info'" 
                    effect="plain"
                    size="small"
                  >
                    {{ scope.row.status === 0 ? '公开' : '私有' }}
                  </el-tag>
                </template>
                <span v-else>-</span>
              </div>
            </template>
          </el-table-column>
          
          <!-- 标签列 (非搜索模式显示) -->
          <el-table-column v-if="!isSearchMode && currentLocationDocuments.some(doc => !doc.isFolder)" label="标签" min-width="130" align="center" header-align="center">
            <template #header>
              <span style="text-align: center; display: block;">标签</span>
            </template>
            <template #default="scope">
              <div style="text-align: center;">
                <template v-if="!scope.row.isFolder && scope.row.tags && scope.row.tags.length > 0">
                  <el-tag 
                    v-for="tagId in scope.row.tags" 
                    :key="tagId"
                    size="small"
                    class="tag-in-table"
                  >
                    {{ getTagName(tagId) }}
                  </el-tag>
                </template>
                <span v-else>-</span>
              </div>
            </template>
          </el-table-column>
          
          <!-- 版本列 (非搜索模式显示) -->
          <el-table-column v-if="!isSearchMode && currentLocationDocuments.some(doc => !doc.isFolder)" label="版本" width="100" align="center" header-align="center">
            <template #header>
              <span style="text-align: center; display: block;">版本</span>
            </template>
            <template #default="scope">
              <div style="text-align: center;">
                <el-tooltip content="查看历史版本" placement="top">
                  <span style="cursor:pointer;color:#409EFF" @click.stop="showHistoryVersions(scope.row)">
                    <template v-if="scope.row.versions && scope.row.versions.length > 1">
                      {{ scope.row.versions.length }} 个版本
                    </template>
                    <template v-else-if="scope.row.currentVersion">
                      v{{ scope.row.currentVersion }}
                    </template>
                    <template v-else>-</template>
                  </span>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          
          <!-- 操作列 (非搜索模式显示) -->
          <el-table-column v-if="!isSearchMode" label="操作" width="150" align="center" header-align="center" fixed="right">
            <template #header>
              <span style="text-align: center; display: block;">操作</span>
            </template>
            <template #default="scope">
              <div class="table-actions" style="display: flex; justify-content: center; gap: 5px;">
                <el-button type="primary" size="small" text @click="handleCommand('edit', scope.row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button v-if="!scope.row.isFolder" type="info" size="small" text @click="handleCommand('download', scope.row)">
                  <el-icon><Download /></el-icon>
                </el-button>
                <el-button v-if="!scope.row.isFolder" :type="publishStateMap[scope.row.id] ? 'warning' : 'success'" size="small" text @click="handleCommand(publishStateMap[scope.row.id] ? 'unpublish' : 'publish', scope.row)">
                  <el-icon v-if="publishStateMap[scope.row.id]"><TurnOff /></el-icon>
                  <el-icon v-else><Share /></el-icon>
                </el-button>
                <el-button type="danger" size="small" text @click="handleCommand('delete', scope.row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
       
        
        <!-- 分页控件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="currentLocationDocuments.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
  
      <!-- 上传文档对话框 -->
      <el-dialog
        v-model="uploadDialogVisible"
        title="上传文档"
        width="600px"
      >
        <el-form :model="uploadForm" label-width="100px">
          <el-form-item label="文件">
            <el-upload
              class="upload-area"
              drag
              multiple
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :file-list="uploadFiles"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                拖拽文件到此处 或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持上传Word、Excel、PPT、PDF等常见文档格式
                </div>
              </template>
            </el-upload>
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="uploadForm.category" placeholder="选择文档分类">
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
            <el-button link type="primary" @click="showCreateCategory">
              创建新分类
            </el-button>
          </el-form-item>
          <el-form-item label="标签">
            <el-select
              v-model="uploadForm.tags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="选择或创建标签"
            >
              <el-option
                v-for="tag in allTags"
                :key="tag.id"
                :label="tag.name"
                :value="tag.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="描述">
            <el-input 
              v-model="uploadForm.description"
              type="textarea" 
              :rows="3" 
              placeholder="添加文档描述..."
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="uploadDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="uploadDocuments">
              上传
            </el-button>
          </span>
        </template>
      </el-dialog>
  
      <!-- 版本历史对话框 -->
      <el-dialog
        v-model="versionHistoryVisible"
        :title="`版本历史 - ${currentDocument?.name || ''}`"
        width="650px"
      >
        <el-timeline>
          <el-timeline-item
            v-for="(version, index) in currentDocument?.versions"
            :key="version.id"
            :type="index === 0 ? 'primary' : ''"
            :hollow="index !== 0"
            :timestamp="formatDate(version.createdAt)"
          >
            <div class="version-item">
              <div class="version-info">
                <h4>版本 {{ version.versionNumber }}</h4>
                <div class="version-meta">
                  <span>{{ version.createdBy }}</span>
                  <span>大小: {{ formatFileSize(version.size) }}</span>
          </div>
                <div class="version-desc" v-if="version.description">
                  {{ version.description }}
                </div>
              </div>
              <div class="version-actions">
                <el-button size="small" type="primary" @click="previewVersion(version)">预览</el-button>
                <el-button size="small" @click="downloadVersion(version)">下载</el-button>
                <el-button 
                  v-if="index !== 0" 
                  size="small" 
                  type="warning" 
                  @click="restoreVersion(version)"
                >恢复此版本</el-button>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
      <!-- 分享页面 -->
      <div v-if="activeTab === 'sharing'" class="sharing-view">
        <!-- 协作与分享内容 -->
        <div class="shares-filter">
          <el-input
            v-model="shareSearchKeyword"
            placeholder="搜索分享..."
            :prefix-icon="Search"
            clearable
            @input="searchShares"
            style="width: 250px; margin-right: 15px;"
          />
          <el-select v-model="shareTypeFilter" placeholder="分享类型" clearable @change="filterShares" style="width: 150px; margin-right: 15px;">
            <el-option label="全部类型" value="" />
            <el-option label="文档" value="document" />
            <el-option label="文件夹" value="folder" />
            <el-option label="学习计划" value="learning-plan" />
            <el-option label="知识图谱" value="knowledge-map" />
          </el-select>
          <el-select v-model="shareStatusFilter" placeholder="分享状态" clearable @change="filterShares" style="width: 150px;">
            <el-option label="全部状态" value="" />
            <el-option label="有效" value="active" />
            <el-option label="已过期" value="expired" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </div>
        
        <!-- 分享列表 -->
        <div class="sharing-list-container" v-loading="sharingLoading">
          <el-table :data="filteredShares" style="width: 100%" header-align="center" :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266', fontWeight: 'bold' }" :cell-style="{ textAlign: 'center' }" :fit="true">
            <el-table-column label="内容名称" width="100" align="left" header-align="left">
              <template #header>
                <span style="text-align: left; display: block; padding-left: 10px;">内容名称</span>
              </template>
              <template #default="scope">
                <div class="share-name" style="display: flex; align-items: center; justify-content: flex-start;">
                  <el-icon :size="18" class="share-icon" style="margin-right: 8px;">
                    <component :is="getShareTypeIcon(scope.row.type)"></component>
                  </el-icon>
                  <span>{{ scope.row.title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="分享时间" width="50" align="center" header-align="center">
              <template #header>
                <span style="text-align: center; display: block;">分享时间</span>
              </template>
              <template #default="scope">
                <div style="text-align: center;">{{ formatDate(scope.row.sharedAt) }}</div>
              </template>
            </el-table-column>
            <el-table-column label="访问次数" width="100" align="center" header-align="center">
              <template #header>
                <span style="text-align: center; display: block;">访问次数</span>
              </template>
              <template #default="scope">
                <div style="text-align: center;">{{ scope.row.views }}</div>
              </template>
            </el-table-column>
            <el-table-column label="权限" width="50" align="center" header-align="center">
              <template #header>
                <span style="text-align: center; display: block;">权限</span>
              </template>
              <template #default="scope">
                <div style="text-align: center;">
                  <el-tag type="info" size="small" effect="plain">
                    {{ scope.row.isPublic ? '公开访问' : '私密链接' }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center" header-align="center" fixed="right">
              <template #header>
                <span style="text-align: center; display: block;">操作</span>
              </template>
              <template #default="scope">
                <div class="share-actions" style="display: flex; justify-content: center; gap: 5px;">
                  <el-button size="small" type="primary" text @click="viewSharedContent(scope.row)">
                    <el-icon><View /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页控件 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="shareCurrentPage"
              v-model:page-size="sharePageSize"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalSharesCount"
              @size-change="handleShareSizeChange"
              @current-change="handleShareCurrentChange"
            />
          </div>
        </div>
      </div>
      
      <!-- 分享内容对话框 -->
      <!-- <el-dialog
        v-model="shareDialogVisible"
        title="分享内容"
        width="600px"
      >
        <el-form :model="shareForm" label-width="120px">
          <el-form-item label="分享类型">
            <el-select v-model="shareForm.contentType" placeholder="选择要分享的内容类型">
              <el-option label="文档" value="document" />
              <el-option label="文件夹" value="folder" />
              <el-option label="学习计划" value="learning-plan" />
              <el-option label="知识图谱" value="knowledge-map" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="选择内容">
            <el-select
              v-model="shareForm.contentId" 
              placeholder="选择要分享的具体内容"
              filterable
            >
              <el-option
                v-for="item in availableShareContent" 
                :key="item.id" 
                :label="item.title" 
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="分享位置">
            <el-checkbox-group v-model="shareForm.shareTargets">
              <el-checkbox label="private">个人链接</el-checkbox>
              <el-checkbox label="team">团队知识库</el-checkbox>
              <el-checkbox label="community">社区交流</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          
          <template v-if="shareForm.shareTargets.includes('team')">
            <el-form-item label="选择团队">
              <el-select v-model="shareForm.teamId" placeholder="选择要分享到的团队">
                <el-option 
                  v-for="team in teamList" 
                  :key="team.id" 
                  :label="team.name" 
                  :value="team.id"
                />
              </el-select>
            </el-form-item>
                </template>
          
          <template v-if="shareForm.shareTargets.includes('community')">
            <el-form-item label="社区分类">
              <el-select v-model="shareForm.communityCategory" placeholder="选择社区分类">
                <el-option label="前端开发" value="frontend" />
                <el-option label="后端开发" value="backend" />
                <el-option label="移动开发" value="mobile" />
                <el-option label="数据科学" value="data-science" />
                <el-option label="运维/DevOps" value="devops" />
                <el-option label="产品设计" value="product" />
                <el-option label="其他" value="other" />
              </el-select>
          </el-form-item>
            
            <el-form-item label="社区标签">
              <el-select
                v-model="shareForm.communityTags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="添加标签（可创建新标签）"
              >
                <el-option label="Vue" value="vue" />
                <el-option label="React" value="react" />
                <el-option label="TypeScript" value="typescript" />
                <el-option label="Java" value="java" />
                <el-option label="Python" value="python" />
                <el-option label="算法" value="algorithm" />
                <el-option label="架构" value="architecture" />
              </el-select>
            </el-form-item>
          </template>
          
          <el-form-item label="分享权限" v-if="shareForm.shareTargets.includes('private')">
            <el-radio-group v-model="shareForm.isPublic">
              <el-radio :label="false">私密链接</el-radio>
              <el-radio :label="true">公开访问</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="有效期" v-if="shareForm.shareTargets.includes('private')">
            <el-select v-model="shareForm.expiryOption">
              <el-option label="7天" value="7days" />
              <el-option label="30天" value="30days" />
              <el-option label="永久" value="never" />
              <el-option label="自定义" value="custom" />
            </el-select>
            
            <el-date-picker
              v-if="shareForm.expiryOption === 'custom'"
              v-model="shareForm.expiryDate"
              type="date"
              placeholder="选择日期"
              style="margin-top: 10px; width: 100%;"
            />
          </el-form-item>
          
          <el-form-item label="访问密码" v-if="shareForm.shareTargets.includes('private') && !shareForm.isPublic">
            <el-input
              v-model="shareForm.password"
              placeholder="可选，留空则不设置密码"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="分享给用户" v-if="shareForm.shareTargets.includes('private') && !shareForm.isPublic">
            <el-select
              v-model="shareForm.sharedUsers"
              multiple
              filterable
              placeholder="选择用户（可选）"
            >
              <el-option
                v-for="user in userList"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="描述">
            <el-input
              v-model="shareForm.description"
              type="textarea"
              :rows="3"
              placeholder="添加分享描述信息..."
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="shareDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitShareContent">
              确认分享
            </el-button>
          </span>
        </template>
      </el-dialog> -->

      <!-- 知识摘要对话框 -->
      <el-dialog
        v-model="knowledgeSummaryVisible"
        title="知识摘要"
        width="500px"
      >
        <div class="knowledge-summary-content">
          <p>{{ currentKnowledgeSummary }}</p>
    </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="knowledgeSummaryVisible = false">关闭</el-button>
            <el-button type="primary" @click="viewFullDocument">查看完整文档</el-button>
          </span>
  </template>
      </el-dialog>

      <!-- 文档内容对话框 -->
      <el-dialog
        v-model="documentContentVisible"
        :title="currentDocument?.name || '文档内容'"
        width="600px"
      >
        <div class="document-content">
          <div v-html="currentDocumentContent"></div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="documentContentVisible = false">关闭</el-button>
          </span>
        </template>
      </el-dialog>


      <!-- 管理收藏对话框 -->
      <el-dialog
        v-model="manageFavoritesVisible"
        title="管理收藏"
        width="650px"
      >
        <div class="manage-favorites-content">
          <el-tabs v-model="favoritesTabActive">
            <!-- 当前收藏标签页 -->
            <el-tab-pane label="当前收藏" name="current">
              <!-- 文件路径导航 -->
              <div class="file-path-nav">
                <div class="path-nav-container" style="justify-content: flex-start;">
                  <el-button 
                    v-if="currentFavoritePath.length > 0" 
                    size="small" 
                    icon="ArrowLeft" 
                    @click="navigateBackFavorites" 
                    class="back-button"
                  >
                    返回上一页
                  </el-button>
                  
                  <el-breadcrumb separator="/" v-if="currentFavoritePath.length > 0" style="margin-left: 0;">
                    <el-breadcrumb-item :to="{ path: '' }" @click="navigateToRootFavorites">全部收藏</el-breadcrumb-item>
                    <el-breadcrumb-item 
                      v-for="(folder, index) in currentFavoritePath" 
                      :key="index"
                      :to="{ path: '' }"
                      @click="navigateToFavoritesPath(index)"
                    >
                      {{ folder.name }}
                    </el-breadcrumb-item>
                  </el-breadcrumb>
                  <span v-else style="margin-left: 0;">全部收藏</span>
                </div>
              </div>
              
              <!-- 收藏内容表格 -->
              <el-table
                :data="currentLocationFavorites"
                style="width: 100%"
                v-loading="favoritesLoading"
                @row-click="handleFavoriteRowClick"
                :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266', fontWeight: 'bold' }" 
                :cell-style="{ textAlign: 'center' }" 
                :fit="true"
                :border="false"
              >
                <template #empty>
                  <el-empty :description="currentFavoritePath.length === 0 ? '暂无收藏内容' : '该文件夹下暂无内容'" />
                </template>
                
                <el-table-column label="名称" min-width="130" align="left" header-align="left">
                  <template #header>
                    <span style="text-align: left; display: block; padding-left: 10px;">名称</span>
                  </template>
                  <template #default="scope">
                    <div class="file-name-cell" style="display: flex; align-items: center; justify-content: flex-start;">
                      <el-icon :size="18" class="file-icon" style="margin-right: 8px;">
                        <component :is="scope.row.isFolder ? FolderOpened : getFileIcon(scope.row.type)"></component>
                      </el-icon>
                      <span 
                        :class="{ 'folder-name': scope.row.isFolder }"
                        @click.stop="scope.row.isFolder ? enterFavoriteFolder(scope.row) : null"
                      >{{ scope.row.isFolder ? scope.row.name || scope.row.title : scope.row.title }}</span>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column label="类型" width="100" align="center" header-align="center">
                  <template #header>
                    <span style="text-align: center; display: block;">类型</span>
                  </template>
                  <template #default="scope">
                    <el-tag size="small">{{ scope.row.isFolder ? '文件夹' : getDocumentTypeName(scope.row.type) }}</el-tag>
                  </template>
                </el-table-column>
                
                <el-table-column label="收藏时间" width="120" align="center" header-align="center">
                  <template #header>
                    <span style="text-align: center; display: block;">收藏时间</span>
                  </template>
                  <template #default="scope">
                    {{ formatDate(scope.row.favoriteTime || new Date()) }}
                  </template>
                </el-table-column>
                
                <el-table-column label="操作" width="100" align="center" header-align="center" fixed="right">
                  <template #header>
                    <span style="text-align: center; display: block;">操作</span>
                  </template>
                  <template #default="scope">
                    <div class="favorites-actions" style="display: flex; justify-content: center; gap: 5px;">
                      <template v-if="!scope.row.isFolder">
                        <el-button size="small" type="primary" text @click.stop="openDocument(scope.row)">
                          <el-icon><View /></el-icon>
                        </el-button>
                      </template>
                      <el-button size="small" type="primary" text @click.stop="scope.row.isFolder ? createFavoriteSubFolder(scope.row) : null">
                        <el-icon><FolderAdd /></el-icon>
                      </el-button>
                      <el-button size="small" type="danger" text @click.stop="removeFavorite(scope.row)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            
            <!-- 添加收藏标签页 -->
            <el-tab-pane label="添加收藏" name="add">
              <div class="add-favorites-header">
                <el-input
                  v-model="favoriteSearchKeyword"
                  placeholder="搜索文档..."
                  prefix-icon="Search"
                  clearable
                  @input="searchForFavorites"
                  style="width: 250px; margin-right: 10px;"
                />
                <el-button type="primary" size="small" @click="createRootFavoriteFolder">
                  <el-icon><FolderAdd /></el-icon> 新建文件夹
                </el-button>
              </div>
              
              <el-table
                :data="filteredNonFavoriteDocuments"
                style="width: 100%"
                v-loading="favoritesLoading"
              >
                <el-table-column label="文档名称" min-width="200">
                  <template #default="scope">
                    <div class="favorite-name-cell">
                      <el-icon :size="18" class="file-icon">
                        <component :is="getFileIcon(scope.row.type)"></component>
                      </el-icon>
                      <span>{{ scope.row.name }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="类型" width="100">
                  <template #default="scope">
                    <el-tag size="small">{{ getDocumentTypeName(scope.row.type) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="最后修改" width="150">
                  <template #default="scope">
                    {{ formatDate(scope.row.lastModified) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                  <template #default="scope">
                    <div style="display: flex; gap: 5px;">
                      <el-button size="small" type="primary" @click="addToFavorites(scope.row)">收藏</el-button>
                      <el-select 
                        v-model="scope.row.favoriteFolder" 
                        placeholder="选择文件夹" 
                        size="small" 
                        style="width: 100px;"
                        @change="(val) => addToSpecificFolder(scope.row, val)"
                      >
                        <el-option label="根目录" :value="null" />
                        <el-option 
                          v-for="folder in allFavoriteFolders" 
                          :key="folder.id" 
                          :label="folder.title || folder.name" 
                          :value="folder.id" 
                        />
                      </el-select>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div class="empty-favorites" v-if="filteredNonFavoriteDocuments.length === 0">
                <el-empty description="没有找到可添加的文档" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="manageFavoritesVisible = false">关闭</el-button>
          </span>
        </template>
      </el-dialog>


      <!-- 编辑知识对话框 -->
      <el-dialog
        v-model="editKnowledgeDialogVisible"
        title="编辑知识"
        width="550px"
      >
        <el-form :model="editKnowledgeForm" label-width="80px">
          <el-form-item label="名称" required>
            <el-input v-model="editKnowledgeForm.name" placeholder="请输入知识名称" />
          </el-form-item>
          
          <el-form-item label="摘要">
            <el-input 
              v-model="editKnowledgeForm.summary" 
              type="textarea" 
              :rows="4" 
              placeholder="请输入知识摘要..." 
            />
          </el-form-item>
          
          <el-form-item label="标签">
            <el-select
              v-model="editKnowledgeForm.tags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="选择或创建标签"
              style="width: 100%;"
            >
              <el-option
                v-for="tag in allTags"
                :key="tag.id"
                :label="tag.name"
                :value="tag.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="状态">
            <el-radio-group v-model="editKnowledgeForm.status">
              <el-radio :label="1">私有</el-radio>
              <el-radio :label="0">公开</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editKnowledgeDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitEditKnowledge">保存</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 新建知识对话框 -->
      <el-dialog
        v-model="newKnowledgeDialogVisible"
        title="新建知识"
        width="600px"
      >
        <el-form :model="newKnowledgeForm" label-width="100px">
          <el-form-item label="知识名称" required>
            <el-input v-model="newKnowledgeForm.name" placeholder="输入知识名称" />
          </el-form-item>
          <el-form-item label="上传文件" required>
            <el-upload
              class="upload-area"
              :auto-upload="false"
              :limit="1"
              :file-list="newKnowledgeFileList"
              :on-change="handleNewKnowledgeFileChange"
              :before-remove="handleRemoveNewKnowledgeFile"
              :on-remove="handleRemoveNewKnowledgeFile"
              :show-file-list="true"
              drag
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                拖拽文件到此处 或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持上传Word、PDF、PPT、Markdown等文档
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="newKnowledgeDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="createNewKnowledge" :loading="createKnowledgeLoading">
              创建
            </el-button>
          </span>
        </template>
      </el-dialog>
     
      <!-- 历史版本对话框 -->
     <el-dialog 
  v-model="historyVersionDialogVisible" 
  title="历史版本" 
  width="650px" 
  :close-on-click-modal="false"
  destroy-on-close
>
  <div class="history-version-container">
    <el-table 
      :data="historyVersions" 
      v-loading="historyLoading" 
      style="width:100%"
      border
      stripe
      :header-cell-style="{
        backgroundColor: '#f5f7fa', 
        color: '#606266', 
        fontWeight: 'bold', 
        textAlign: 'center',
        padding: '12px 0'
      }"
      :cell-style="{
        textAlign: 'center',
        padding: '12px 0'
      }"
    >
      <el-table-column label="版本号" prop="fileVersion" width="90" align="center">
        <template #default="scope">
          <el-tag size="small" effect="plain" type="info">{{ scope.row.fileVersion }}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="创建时间" prop="createTime" width="180" align="center">
        <template #default="scope">{{ formatDate(new Date(scope.row.createTime), 'short') }}</template>
      </el-table-column>
      
      <el-table-column v-if="historyVersions.length > 1" label="修改人" width="120" align="center">
        <template #default="scope">{{ scope.row.updatePerson || '-' }}</template>
      </el-table-column>
      
      <el-table-column v-if="historyVersions.length > 1" label="操作" min-width="160" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleRollbackVersion(scope.row)">回滚到该版本</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
  
  <template #footer>
    <div class="dialog-footer">
      <el-button @click="historyVersionDialogVisible = false">关闭</el-button>
    </div>
  </template>
     </el-dialog>

      <!-- 创建学习任务对话框 -->
      <el-dialog
        v-model="createTaskDialogVisible"
        title="创建学习任务"
        width="500px"
      >
        <el-form :model="createTaskForm" :rules="createTaskRules" ref="createTaskFormRef" label-width="80px">
          <el-form-item label="任务名称" prop="agencyName">
            <el-input v-model="createTaskForm.agencyName" placeholder="请输入任务名称" />
          </el-form-item>
          <el-form-item label="截止时间" prop="deadline">
            <el-date-picker
              v-model="createTaskForm.deadline"
              type="datetime"
              placeholder="选择截止时间"
              style="width: 100%;"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="createTaskDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitCreateTask">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
  import { 
    Plus, Refresh, Search, FolderOpened, Document, Calendar,
    Delete, Edit, Download, Share, Star, StarFilled,
    Picture, Collection, Link, Files, Lightning, Warning, Reading, Histogram,
    Upload, FolderAdd, List, Grid, ArrowDown, Timer,
    View, CopyDocument, Close, DocumentCopy, ChatLineSquare,
    DocumentAdd, TurnOff
  } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { formatDistanceToNow, format, isAfter } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { createKnowledgeSet, getKnowledgeSets, deleteKnowledgeSet, getAllKnowledge, updateKnowledgeSet, deleteKnowledge, getKnowledge, searchKnowledge, updateKnowledgePreview, createKnowledge, publishKnowledge, cancelPublishKnowledge, getKnowledgeVersions, rollbackKnowledgeVersion, getKnowledgeCreateCount, getUserFavoriteFolders, getFavoriteFolderItems, createUserAgency } from '@/api/knowledge'
import { fileDownload, fileUpload } from '@/api/file'

// 活动标签
const activeTab = ref('dashboard')
const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

// 快捷入口数据
const recentDocuments = ref([
  { 
    id: 1, 
    title: '2023年项目规划文档', 
    type: 'docx', 
    lastModified: new Date(2023, 8, 25, 14, 30) 
  },
  { 
    id: 2, 
    title: '前端技术栈学习笔记', 
    type: 'md', 
    lastModified: new Date(2023, 8, 24, 10, 15) 
  },
  { 
    id: 3, 
    title: '产品需求分析报告', 
    type: 'pdf', 
    lastModified: new Date(2023, 8, 23, 16, 45) 
  },
  { 
    id: 4, 
    title: '团队会议纪要', 
    type: 'docx', 
    lastModified: new Date(2023, 8, 22, 9, 0) 
  },
  { 
    id: 5, 
    title: '数据分析报表', 
    type: 'xlsx', 
    lastModified: new Date(2023, 8, 21, 11, 20) 
  }
])

const pendingTasks = ref([
  { 
    id: 1, 
    title: '阅读《设计模式》第3章', 
    dueDate: new Date(2023, 8, 28), 
    completed: false 
  },
  { 
    id: 2, 
    title: '完成React基础学习', 
    dueDate: new Date(2023, 8, 26), 
    completed: false 
  },
  { 
    id: 3, 
    title: '复习Vue3组合式API', 
    dueDate: new Date(2023, 8, 30), 
    completed: false 
  },
  { 
    id: 4, 
    title: '整理项目文档', 
    dueDate: new Date(2023, 8, 24), 
    completed: false 
  },
  { 
    id: 5, 
    title: '准备技术分享PPT', 
    dueDate: new Date(2023, 9, 2), 
    completed: false 
  }
])

const favoriteDocuments = ref([
  { id: 1, title: 'JavaScript高级编程指南', type: 'pdf', favoriteTime: new Date(2023, 7, 15), isFolder: false, parentId: null },
  { id: 2, title: '前端开发规范', type: 'md', favoriteTime: new Date(2023, 7, 20), isFolder: false, parentId: null },
  { id: 3, title: '项目周报模板', type: 'xlsx', favoriteTime: new Date(2023, 8, 1), isFolder: false, parentId: 5 },
  { id: 4, title: 'API接口文档', type: 'md', favoriteTime: new Date(2023, 8, 5), isFolder: false, parentId: 5 },
  { id: 5, title: '工作文档', type: 'folder', favoriteTime: new Date(2023, 8, 10), isFolder: true, parentId: null },
  { id: 6, title: '前端架构图', type: 'png', favoriteTime: new Date(2023, 8, 15), isFolder: false, parentId: 7 },
  { id: 7, title: '设计资源', type: 'folder', favoriteTime: new Date(2023, 8, 12), isFolder: true, parentId: null }
])

// 数据看板
const statsTimeRange = ref('week')
const contributionStats = reactive({
  uploaded: 8,
  edited: 15,
  shared: 4
})

const learningStats = reactive({
  completed: 12,
  pending: 8,
  completionRate: 60,
  totalPlans: 0,
  completedPlans: 0,
  totalLearningTime: 0,
  totalMaterials: 0
})

// 学习进度颜色
const getProgressColor = computed(() => {
  const rate = learningStats.completionRate
  if (rate < 30) return '#F56C6C'
  if (rate < 70) return '#E6A23C'
  return '#67C23A'
})



// 功能方法
// 格式化日期
const formatDate = (date: Date, formatType?: string): string => {
  if (formatType === 'short') {
    return format(date, 'yyyy-MM-dd HH:mm')
  }
  return formatDistanceToNow(date, { addSuffix: true, locale: zhCN })
}

// 格式化截止日期
const formatDueDate = (date: Date) => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.getDate() === today.getDate() && 
      date.getMonth() === today.getMonth() && 
      date.getFullYear() === today.getFullYear()) {
    return '今天截止'
  } else if (date.getDate() === tomorrow.getDate() && 
             date.getMonth() === tomorrow.getMonth() && 
             date.getFullYear() === tomorrow.getFullYear()) {
    return '明天截止'
  } else {
    return `${format(date, 'MM-dd')} 截止`
  }
}

// 检查是否已过期
const isOverdue = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

// 获取文件图标
const getFileIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    'pdf': Document,
    'docx': Document,
    'xlsx': Collection,
    'pptx': Collection,
    'md': Reading,
    'txt': Document,
    'png': Picture,
    'jpg': Picture,
    'jpeg': Picture,
    'gif': Picture,
    'zip': Files,
    'rar': Files,
    'link': Link
  }
  
  return iconMap[type] || Document
}

// 打开文档
const openDocument = (doc: any) => {
  if (doc.isFolder) {
    // 如果是文件夹，只显示文件夹信息，不进入内部
    console.log('查看文件夹:', doc.name)
    ElMessage.success(`正在查看文件夹: ${doc.name}`)
    // 实际应用中可以显示文件夹详情或预览
  } else {
    // 如果是文件，预览该文件
    console.log('预览文档:', doc.name)
    ElMessage.success(`正在打开文档: ${doc.name}`)
    // 实际应用中应跳转到文档查看页面，或者打开预览模式
  }
}

// 更新任务状态
const updateTaskStatus = (task: any) => {
  console.log('更新任务状态', task)
  if (task.completed) {
    ElMessage.success('任务已完成')
  }
  // 实际应用中应调用API更新任务状态
}

// 创建新文档
const createNewDocument = () => {
  ElMessage.info('创建新文档')
  // 实际应用中应跳转到文档创建页或显示创建对话框
}

// 刷新仪表板
const refreshDashboard = () => {
  ElMessage.success('数据已刷新')
  // 实际应用中应重新加载数据
}

// 前往学习计划
const goToLearningPlan = () => {
  activeTab.value = 'learning'
  ElMessage.info('前往学习计划')
}

// 前往上传文档
const goToUpload = () => {
  activeTab.value = 'documents'
  ElMessage.info('前往上传文档')
}




// 监听统计时间范围变化
watch(statsTimeRange, (newValue) => {
  console.log('统计时间范围变更为:', newValue)
  // 实际应用中应根据时间范围重新加载统计数据
  
  if (newValue === 'month') {
    contributionStats.uploaded = 24
    contributionStats.edited = 47
    contributionStats.shared = 15
    learningStats.completed = 35
    learningStats.pending = 15
    learningStats.completionRate = 80
  } else {
    contributionStats.uploaded = 8
    contributionStats.edited = 15
    contributionStats.shared = 4
    learningStats.completed = 12
    learningStats.pending = 8
    learningStats.completionRate = 60
  }
  
  // 更新图表
  nextTick(() => {
    initContributionChart()
  })
})

// 贡献量图表实例
let contributionChartInstance: echarts.ECharts | null = null

// 初始化贡献量图表
const initContributionChart = () => {
  const chartElement = document.querySelector('.contribution-chart') as HTMLElement
  if (!chartElement) return
  
  if (contributionChartInstance) {
    contributionChartInstance.dispose()
  }
  
  contributionChartInstance = echarts.init(chartElement)
  
  const timeRange = statsTimeRange.value
  let xAxisData: string[]
  let seriesData: number[]
  
  if (timeRange === 'week') {
    xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    seriesData = [2, 5, 3, 6, 4, 2, 1]
  } else {
    xAxisData = Array.from({length: 30}, (_, i) => `${i + 1}日`)
    seriesData = Array.from({length: 30}, () => Math.floor(Math.random() * 8))
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: xAxisData,
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          interval: timeRange === 'week' ? 0 : 'auto'
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '贡献数量',
        type: 'bar',
        barWidth: timeRange === 'week' ? '40%' : '60%',
        data: seriesData,
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  
  contributionChartInstance.setOption(option)
}

// 组件挂载时初始化
onMounted(() => {
  // 确保DOM渲染完成后初始化图表
  nextTick(() => {
    // 确保图表第一次也能正确渲染
    setTimeout(() => {
      initContributionChart()
    }, 100)
  })
  
  // 监听窗口大小变化，重绘图表
  window.addEventListener('resize', () => {
    if (contributionChartInstance) {
      contributionChartInstance.resize()
    }
  })
  
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

// 检查是否为移动设备
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 文档管理数据
const searchKeyword = ref('')
const fileTypeFilter = ref('')
const categoryFilter = ref('')
const sortOption = ref('createdAt')
const viewMode = ref('table')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const uploadDialogVisible = ref(false)
const versionHistoryVisible = ref(false)
const selectedTags = ref<number[]>([])
const currentPath = ref<{id: number, name: string}[]>([])
const currentDocument = ref<any>(null)
const knowledgeSummaryVisible = ref(false)
const currentKnowledgeSummary = ref('')
const documentContentVisible = ref(false)
const currentDocumentContent = ref('')
const isMobile = ref(false) // 是否为移动设备
const publishStateMap = reactive<Record<number, boolean>>({}) // 用于跟踪文档发布状态

// 上传表单
const uploadForm = reactive({
  category: '',
  tags: [] as number[],
  description: ''
})
const uploadFiles = ref<any[]>([])

// 分类列表
const categories = ref([
  { id: 1, name: '技术文档' },
  { id: 2, name: '产品需求' },
  { id: 3, name: '会议记录' },
  { id: 4, name: '培训资料' },
  { id: 5, name: '研究报告' }
])

// 标签列表
const allTags = ref([
  { id: 1, name: '重要' },
  { id: 2, name: '工作' },
  { id: 3, name: '个人' },
  { id: 4, name: '学习' },
  { id: 5, name: '项目' },
  { id: 6, name: '会议' },
  { id: 7, name: '笔记' },
  { id: 8, name: '待处理' },
  { id: 9, name: '已归档' },
  { id: 10, name: '文档' },
])

// 获取常用标签（使用频率最高的标签）
const popularTags = computed(() => {
  // 在实际应用中，这里应该从后端获取使用频率最高的标签
  // 现在我们简单返回前5个标签作为示例
  return allTags.value.slice(0, 5)
})

// 文档列表 (模拟数据)
const documents = ref([
    {
      id: 1,
    name: '产品需求规格说明书.docx',
    type: 'docx',
    size: 1572864, // 1.5MB
    lastModified: new Date(2023, 8, 25, 14, 30),
    createdAt: new Date(2023, 8, 20, 10, 15),
    category: 2,
    tags: [1, 8],
    isFolder: false,
    isNew: false,
    parentId: 4, // 属于"团队会议纪要"文件夹
    summary: '本文档详细描述了产品的功能需求、用户界面设计和技术规格。包含用户故事、交互流程和核心功能模块说明。',
    versions: [
      {
        id: 101,
        versionNumber: 'v1.2',
        createdAt: new Date(2023, 8, 25, 14, 30),
        createdBy: '张三',
        size: 1572864,
        description: '更新了功能描述和界面原型'
      },
      {
        id: 100,
        versionNumber: 'v1.1',
        createdAt: new Date(2023, 8, 22, 9, 45),
        createdBy: '李四',
        size: 1423360,
        description: '修正了部分需求描述'
      },
      {
        id: 99,
        versionNumber: 'v1.0',
        createdAt: new Date(2023, 8, 20, 10, 15),
        createdBy: '张三',
        size: 1258291,
        description: '初始版本'
      }
    ]
    },
    {
      id: 2,
    name: '前端开发规范.md',
    type: 'md',
    size: 524288, // 512KB
    lastModified: new Date(2023, 8, 24, 11, 20),
    createdAt: new Date(2023, 8, 24, 9, 30),
    category: 1,
    tags: [4, 6],
    isFolder: false,
    isNew: false,
    parentId: null, // 在根目录
    summary: '定义了前端项目的代码规范，包括命名约定、文件组织、组件设计原则、CSS编写规则和工具配置指南。',
    versions: [
      {
        id: 102,
        versionNumber: 'v1.0',
        createdAt: new Date(2023, 8, 24, 11, 20),
        createdBy: '王五',
        size: 524288,
        description: '初始版本'
      }
    ]
    },
    {
      id: 3,
    name: '项目进度报表.xlsx',
    type: 'xlsx',
    size: 786432, // 768KB
    lastModified: new Date(2023, 8, 23, 16, 45),
    createdAt: new Date(2023, 8, 23, 15, 10),
    category: 5,
    tags: [1, 3],
    isFolder: false,
    isNew: false,
    parentId: 7, // 属于"项目管理"文件夹
    summary: '包含各项目的进度跟踪、资源分配、关键里程碑完成情况和风险分析，每周更新一次。',
    versions: [
      {
        id: 103,
        versionNumber: 'v2.1',
        createdAt: new Date(2023, 8, 23, 16, 45),
        createdBy: '赵六',
        size: 786432,
        description: '更新了本月数据'
      },
      {
        id: 104,
        versionNumber: 'v2.0',
        createdAt: new Date(2023, 8, 15, 14, 30),
        createdBy: '赵六',
        size: 752640,
        description: '重新设计了报表格式'
      }
    ]
    },
    {
      id: 4,
    name: '团队会议纪要',
    type: 'folder',
    size: 0,
    lastModified: new Date(2023, 8, 22, 17, 0),
    createdAt: new Date(2023, 8, 10, 9, 0),
    category: 3,
    tags: [],
    isFolder: true,
    isNew: false,
    parentId: null, // 在根目录
    summary: '包含所有团队会议的纪要文档，按时间排序整理。',
    versions: []
    },
    {
      id: 5,
    name: '技术方案设计.pdf',
    type: 'pdf',
    size: 3145728, // 3MB
    lastModified: new Date(2023, 8, 21, 14, 20),
    createdAt: new Date(2023, 8, 20, 11, 30),
    category: 1,
    tags: [4, 5],
    isFolder: false,
    isNew: false,
    parentId: null, // 在根目录
    summary: '详细的系统架构设计文档，包含技术选型依据、组件关系图、数据流程和API设计规范。',
    versions: [
      {
        id: 105,
        versionNumber: 'v1.1',
        createdAt: new Date(2023, 8, 21, 14, 20),
        createdBy: '李四',
        size: 3145728,
        description: '更新了系统架构图'
      },
      {
        id: 106,
        versionNumber: 'v1.0',
        createdAt: new Date(2023, 8, 20, 11, 30),
        createdBy: '李四',
        size: 2936012,
        description: '初始版本'
      }
    ]
    },
    {
      id: 6,
    name: '新员工培训手册.pptx',
    type: 'pptx',
    size: 5242880, // 5MB
    lastModified: new Date(2023, 8, 18, 10, 0),
    createdAt: new Date(2023, 8, 15, 16, 45),
    category: 4,
    tags: [3],
    isFolder: false,
    isNew: false,
    parentId: null, // 在根目录
    summary: '针对新入职员工的培训材料，涵盖公司介绍、业务流程、技术栈概览和团队协作工具使用指南。',
    versions: [
      {
        id: 107,
        versionNumber: 'v1.0',
        createdAt: new Date(2023, 8, 18, 10, 0),
        createdBy: '王五',
        size: 5242880,
        description: '初始版本'
      }
    ]
    },
    {
      id: 7,
    name: '项目管理',
    type: 'folder',
    size: 0,
    lastModified: new Date(2023, 8, 20, 9, 0),
    createdAt: new Date(2023, 8, 15, 10, 0),
    category: 5,
    tags: [],
    isFolder: true,
    isNew: false,
    parentId: null, // 在根目录
    summary: '包含所有项目管理相关文档和报表。',
    versions: []
  },
  {
    id: 8,
    name: '周会纪要-2023-09-25.docx',
    type: 'docx',
    size: 358400, // 350KB
    lastModified: new Date(2023, 8, 25, 17, 30),
    createdAt: new Date(2023, 8, 25, 16, 0),
    category: 3,
    tags: [8],
    isFolder: false,
    isNew: false,
    parentId: 4, // 属于"团队会议纪要"文件夹
    summary: '本周团队工作进展汇报，包含各成员完成的任务、遇到的问题和下周工作计划。',
    versions: [
      {
        id: 108,
        versionNumber: 'v1.0',
        createdAt: new Date(2023, 8, 25, 17, 30),
        createdBy: '张三',
        size: 358400,
        description: '初始版本'
      }
    ]
  }
])

// 过滤后的文档 (根据搜索关键字、文件类型、分类和标签)
const filteredDocuments = computed(() => {
  let result = documents.value

  // 搜索关键字过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(doc => doc.name.toLowerCase().includes(keyword))
  }
  
  // 文件类型过滤
  if (fileTypeFilter.value) {
    const typeMap: Record<string, string[]> = {
      'document': ['docx', 'pdf', 'txt', 'md'],
      'spreadsheet': ['xlsx', 'csv'],
      'presentation': ['pptx'],
      'image': ['png', 'jpg', 'jpeg', 'gif'],
      'other': ['zip', 'rar', 'other']
    }
    
    result = result.filter(doc => {
      if (fileTypeFilter.value === 'folder' && doc.isFolder) return true
      if (doc.isFolder) return false
      return typeMap[fileTypeFilter.value]?.includes(doc.type)
    })
  }
  
  // 分类过滤
  if (categoryFilter.value) {
    result = result.filter(doc => doc.category.toString() === categoryFilter.value.toString())
  }
  
  // 标签过滤
  if (selectedTags.value.length > 0) {
    result = result.filter(doc => {
      return selectedTags.value.some(tagId => doc.tags.includes(tagId))
    })
  }
  
  // 排序
  result = [...result].sort((a, b) => {
    switch (sortOption.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'size':
        return b.size - a.size
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'lastModified':
      default:
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    }
  })
  
  return result
})

// 文档总数
const totalDocumentsCount = computed(() => {
  return filteredDocuments.value.length
})

// 文件大小格式化
const formatFileSize = (size: number): string => {
  if (size === 0) return '-'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  
  return `${size.toFixed(1)} ${units[i]}`
}

// 获取分类名称
const getCategoryName = (categoryId: number): string => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '-'
}

// 获取标签名称
const getTagName = (tagId: number): string => {
  const tag = allTags.value.find(t => t.id === tagId)
  return tag ? tag.name : '-'
}

// 获取文件类型图标
const getFileTypeIcon = (type: string): any => {
  const iconMap: Record<string, any> = {
    'folder': FolderOpened,
    'docx': Document,
    'pdf': Document,
    'txt': Document,
    'md': Reading,
    'xlsx': Collection,
    'csv': Collection,
    'pptx': Collection,
    'png': Picture,
    'jpg': Picture,
    'jpeg': Picture,
    'gif': Picture,
    'zip': Files,
    'rar': Files
  }
  
  return iconMap[type] || Document
}

// 搜索相关
const isSearchMode = ref(false)
const searchResultInfo = ref('')

// 文档搜索
const searchDocuments = () => {
  if (!searchKeyword.value.trim()) {
    // 如果搜索关键词为空，重置搜索模式
    isSearchMode.value = false;
    return;
  }
  
  loading.value = true;
  
  // 调用searchKnowledge接口，传入关键词和固定space值1
  searchKnowledge(searchKeyword.value, 1)
    .then((response: any) => {
      if (response.data && response.data.code === 200) {
        // 处理返回的搜索结果
        if (response.data.data && Array.isArray(response.data.data)) {
          const searchResults = response.data.data.map((item: any) => ({
            id: item.id,
            name: item.name || '-',
            type: item.dataType === 1 ? 'doc' : 'other',
            size: 0,
            lastModified: item.updateTime ? new Date(item.updateTime) : new Date(),
            createdAt: item.createTime ? new Date(item.createTime) : new Date(),
            createTime: item.createTime,
            updateTime: item.updateTime,
            summary: item.summary || '-',
            category: item.category || 1,
            status: item.status !== undefined ? item.status : 1,
            tags: item.tags || [],
            isFolder: false,
            isNew: false,
            parentId: item.parentId,
            content: item.content,
            currentVersion: item.currentVersion,
            versionCount: item.versionCount,
            versions: []
          }));
          
          // 更新文档列表为搜索结果
          documents.value = searchResults;
          
          // 设置搜索模式
          isSearchMode.value = true;
          // searchResultInfo.value = `找到 ${searchResults.length} 条结果`;
          
          // 重置当前页码
          currentPage.value = 1;
          
          if (searchResults.length === 0) {
            ElMessage.info('未找到匹配的知识内容');
          } else {
            ElMessage.success(`搜索到 ${searchResults.length} 条结果`);
          }
        } else {
          documents.value = [];
          isSearchMode.value = true;
          searchResultInfo.value = `未找到与"${searchKeyword.value}"匹配的知识内容`;
          ElMessage.info('未找到匹配的知识内容');
        }
      } else {
        ElMessage.error(`搜索失败: ${response.data?.message || '未知错误'}`);
      }
    })
    .catch((error: any) => {
      console.error('搜索失败:', error);
      ElMessage.error(`搜索失败: ${error.message || '未知错误'}`);
    })
    .finally(() => {
      loading.value = false;
    });
}

// 筛选文档
const filterDocuments = () => {
  console.log('筛选文档 - 类型:', fileTypeFilter.value, '分类:', categoryFilter.value)
  currentPage.value = 1
  // 实际应用中应调用API筛选文档
}

// 排序文档
const sortDocuments = () => {
  console.log('排序文档:', sortOption.value)
  // 实际应用中应调用API排序文档
}

// 切换标签筛选
const toggleTagFilter = (tagId: number) => {
  const index = selectedTags.value.indexOf(tagId)
  if (index === -1) {
    selectedTags.value.push(tagId)
  } else {
    selectedTags.value.splice(index, 1)
  }
  currentPage.value = 1
  console.log('标签筛选:', selectedTags.value)
  // 实际应用中应调用API按标签筛选文档
}

// 显示所有标签
const showAllTags = () => {
  ElMessage.info('显示所有标签')
  // 实际应用中应显示标签管理对话框
}

// 导航到根目录
const navigateToRoot = () => {
  currentPath.value = []
  console.log('导航到根目录')
  // 加载根目录知识集
  fetchKnowledgeSets()
}

// 导航到指定路径
const navigateToPath = (index: number) => {
  currentPath.value = currentPath.value.slice(0, index + 1)
  console.log('导航到路径:', currentPath.value)
  // 实际应用中应加载指定路径的文档
}

// 进入文件夹
const enterFolder = (folder: any) => {
  if (!folder.isFolder) return;
  
  loading.value = true;
  getAllKnowledge(1, folder.id)
    .then(response => {
      if (response.data && response.data.code === 200) {
        // 处理返回的知识库内容数据
        if (response.data.data && Array.isArray(response.data.data)) {
          // 将知识库中的文件添加到当前路径下
          const knowledgeItems = response.data.data.map((item: any) => ({
            id: item.id,
            name: item.name || '-',
            type: item.dataType === 1 ? 'doc' : 'other',
            size: 0,
            lastModified: item.updateTime ? new Date(item.updateTime) : new Date(),
            createdAt: item.createTime ? new Date(item.createTime) : new Date(),
            createTime: item.createTime, // 添加createTime字段
            updateTime: item.updateTime, // 添加updateTime字段
            summary: item.summary || '-',
            category: item.category || 1,
            status: item.status !== undefined ? item.status : 1, // 添加status字段，默认为1(私有)
            tags: item.tags || [],
            isFolder: false,
            isNew: false,
            parentId: folder.id, // 设置父文件夹ID
            content: item.content,
            currentVersion: item.currentVersion,
            versionCount: item.versionCount,
            tagList: item.tagList || [],
            versions: item.versionCount > 0 ? [{
              id: item.id,
              versionNumber: `v${item.currentVersion || '1.0'}`,
              createdAt: item.updateTime || item.createTime || new Date(),
              createdBy: '当前用户',
              size: item.size || 0,
              description: '当前版本'
            }] : []
          }));
          
          // 更新路径，将当前文件夹添加到路径中
          currentPath.value = [...currentPath.value, { id: folder.id, name: folder.name }];
          
          // 更新文档列表，保留原有文件夹，添加新的知识项
          const existingDocs = documents.value.filter(item => !item.parentId || item.parentId !== folder.id);
          documents.value = [...existingDocs, ...knowledgeItems];
          
          // 对于每个非文件夹的知识项，加载详细信息
          knowledgeItems.forEach((item: any) => {
            if (!item.isFolder) {
              // 为每个文档项加载详细信息
              setTimeout(() => {
                loadKnowledgeDetails(item);
              }, 100); // 添加延迟，避免同时发起太多请求
            }
          });
        } else {
          // 没有数据
          ElMessage.info(`知识库 "${folder.name}" 中暂无文档`);
        }
      } else {
        ElMessage.error(`获取知识库内容失败: ${response.data?.message || '未知错误'}`);
      }
    })
    .catch(error => {
      console.error('获取知识库内容失败:', error);
      ElMessage.error(`获取知识库内容失败: ${error.message || '未知错误'}`);
    })
    .finally(() => {
      loading.value = false;
    });
}

// 处理表格行点击
const handleRowClick = (row: any, column: any, event: Event) => {
  // 检查点击是否来自操作列按钮
  // 如果点击的是操作列或其中的按钮，不进行任何操作
  if (column && column.label === '操作') {
    return;
  }
  
  // 检查事件目标是否是按钮或其子元素
  let target = event.target as HTMLElement;
  while (target && target !== event.currentTarget) {
    if (target.tagName === 'BUTTON' || 
        target.classList.contains('el-button') || 
        target.classList.contains('table-actions')) {
      return;
    }
    target = target.parentElement as HTMLElement;
  }
  
  // 文件夹进入功能已移至文件名点击事件，这里只处理文档点击
  if (!row.isFolder) {
    // 加载知识详情
    loadKnowledgeDetails(row);
  }
}

// 加载知识详情
const loadKnowledgeDetails = (knowledge: any) => {
  if (!knowledge || knowledge.isFolder) return;
  
  const spaceId = currentSpaceId.value;
  const setId = knowledge.parentId || 0;
  const knowledgeId = knowledge.id;
  
  loading.value = true;
  getKnowledge(spaceId, setId, knowledgeId)
    .then((response: any) => {
      if (response.data && response.data.code === 200 && response.data.data) {
        const details = response.data.data;
        // 更新文档的详细信息
        const index = documents.value.findIndex(item => item.id === knowledgeId);
        if (index !== -1) {
          // 更新标签
          if (details.tags) {
            documents.value[index].tags = details.tags;
          }
          
          // 更新摘要
          if (details.summary) {
            documents.value[index].summary = details.summary;
          }
          
          // 更新状态
          if (details.status !== undefined) {
            documents.value[index].status = details.status;
            // 更新发布状态映射
            publishStateMap[knowledgeId] = details.status === 2;
          }
          
          // 更新当前版本号
          if (details.currentVersion !== undefined) {
            documents.value[index].currentVersion = details.currentVersion;
          }
          
          // 更新版本信息
          if (details.versions) {
            documents.value[index].versions = details.versions;
          } else if (details.versionCount && details.versionCount > 0) {
            // 如果只有版本数量，创建一个简单的版本数组
            documents.value[index].versions = [{
              id: knowledge.id,
              versionNumber: `v${details.currentVersion || '1.0'}`,
              createdAt: knowledge.updateTime || knowledge.createTime || new Date(),
              createdBy: '当前用户',
              size: knowledge.size || 0,
              description: '当前版本'
            }];
          }
        }
      }
    })
    .catch((error: any) => {
      console.error('获取知识详情失败:', error);
    })
    .finally(() => {
      loading.value = false;
    });
}

// 处理网格项点击
const handleGridItemClick = (doc: any) => {
  console.log('点击文档:', doc.name)
  // 实际应用中应选中该文档
}

// 处理命令
const handleCommand = (command: string, doc: any) => {
  switch (command) {
    case 'edit':
      if (doc.isFolder) {
        // 如果是文件夹，显示编辑对话框
        ElMessageBox.prompt('请输入新的知识库名称', '编辑知识库', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: doc.name
        }).then(({ value }) => {
          if (value.trim() && value !== doc.name) {
            // 更新知识库名称
            loading.value = true;
            updateKnowledgeSet({
              id: doc.id,
              name: value,
              space: 1
            })
              .then(response => {
                if (response.data && response.data.code === 200) {
                  // 更新本地数据
                  const index = documents.value.findIndex(item => item.id === doc.id);
                  if (index !== -1) {
                    documents.value[index].name = value;
                    ElMessage.success(`已将知识库 "${doc.name}" 重命名为 "${value}"`);
                  }
                } else {
                  ElMessage.error(`更新知识库失败: ${response.data?.message || '未知错误'}`);
                }
              })
              .catch(error => {
                console.error('更新知识库失败:', error);
                ElMessage.error(`更新知识库失败: ${error.message || '未知错误'}`);
              })
              .finally(() => {
                loading.value = false;
              });
          }
        }).catch(() => {
          // 用户取消操作
        });
      } else {
        // 如果是文件，显示编辑对话框
        // 设置当前要编辑的文档
        currentDocument.value = doc;
        
        // 加载文件详情
        loading.value = true;
        getKnowledge(currentSpaceId.value, doc.parentId || 0, doc.id)
          .then((response: any) => {
            if (response.data && response.data.code === 200 && response.data.data) {
              const details = response.data.data;
              
              // 设置表单初始值
              editKnowledgeForm.id = doc.id;
              editKnowledgeForm.setId = doc.parentId || 0;
              editKnowledgeForm.name = doc.name;
              editKnowledgeForm.summary = details.summary || doc.summary || '';
              editKnowledgeForm.tags = details.tags || doc.tags || [];
              editKnowledgeForm.status = details.status !== undefined ? details.status : 1;
              
              // 显示对话框
              editKnowledgeDialogVisible.value = true;
            } else {
              ElMessage.error(`获取知识详情失败: ${response.data?.message || '未知错误'}`);
            }
          })
          .catch((error: any) => {
            console.error('获取知识详情失败:', error);
            ElMessage.error(`获取知识详情失败: ${error.message || '未知错误'}`);
          })
          .finally(() => {
            loading.value = false;
          });
      }
      break;
    case 'download':
      console.log('下载文档:', doc.name)
      // 构造下载路径
      if (!doc.isFolder) {
        loading.value = true
        // 假设文档路径格式为：/知识库ID/文档ID或其他约定格式
        const filePath = `/knowledge/${doc.parentId}/${doc.id}`
        
        fileDownload(filePath)
          .then(response => {
            // 检查响应类型，如果是Blob则直接下载
            if (response.data instanceof Blob) {
              // 创建下载链接并点击
              const url = window.URL.createObjectURL(new Blob([response.data]))
              const link = document.createElement('a')
              link.href = url
              link.setAttribute('download', doc.name) // 使用文档名称作为下载文件名
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              ElMessage.success(`正在下载: ${doc.name}`)
            } else if (response.data && response.data.code === 200) {
              // 如果返回的是成功状态和文件URL
              if (response.data.data && response.data.data.url) {
                window.open(response.data.data.url, '_blank')
                ElMessage.success(`正在下载: ${doc.name}`)
              } else {
                ElMessage.error('下载失败: 文件URL不存在')
              }
            } else {
              ElMessage.error(`下载失败: ${response.data?.message || '未知错误'}`)
            }
          })
          .catch(error => {
            console.error('下载文件失败:', error)
            ElMessage.error(`下载失败: ${error.message || '未知错误'}`)
          })
          .finally(() => {
            loading.value = false
          })
      } else {
        ElMessage.warning('文件夹不支持直接下载')
      }
      break
    case 'rename':
      console.log('重命名文档:', doc.name)
      ElMessageBox.prompt('请输入新的名称', '重命名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: doc.name
      }).then(({ value }) => {
        ElMessage.success(`已将 "${doc.name}" 重命名为 "${value}"`)
        // 实际应用中应调用API重命名文档
      }).catch(() => {})
      break
    case 'move':
      console.log('移动文档:', doc.name)
      showMoveDialog(doc)
      break
    case 'share':
      console.log('分享文档:', doc.name)
      // 打开分享对话框
      shareDialogVisible.value = true
      shareForm.contentType = doc.isFolder ? 'folder' : 'document'
      shareForm.contentId = doc.id
      break
    case 'publish':
      console.log('发布到社区:', doc.name)
      ElMessageBox.confirm(`确定要将 "${doc.name}" 发布到社区吗？`, '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        // 如果不是文件夹才能发布
        if (!doc.isFolder) {
          loading.value = true
          const spaceId = currentSpaceId.value || 1
          const setId = doc.parentId || 0
          publishKnowledge(1, setId, doc.id)
            .then(response => {
              if (response.data && response.data.code === 200) {
                // 更新发布状态
                publishStateMap[doc.id] = true
                // 不再修改文档状态
                ElMessage.success(`已成功发布: ${doc.name}`)
              } else {
                ElMessage.error(`发布失败: ${response.data?.message || '未知错误'}`)
              }
            })
            .catch(error => {
              console.error('发布知识文件失败:', error)
              ElMessage.error(`发布失败: ${error.message || '未知错误'}`)
            })
            .finally(() => {
              loading.value = false
            })
        } else {
          ElMessage.warning('文件夹不能发布到社区')
        }
      }).catch(() => {})
      break
    case 'unpublish':
      console.log('取消发布到社区:', doc.name)
      ElMessageBox.confirm(`确定要取消发布 "${doc.name}" 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 只有非文件夹才能取消发布
        if (!doc.isFolder) {
          loading.value = true
          const spaceId = currentSpaceId.value || 1
          const setId = doc.parentId || 0
          cancelPublishKnowledge(1, setId, doc.id)
            .then(response => {
              if (response.data && response.data.code === 200) {
                // 更新发布状态
                publishStateMap[doc.id] = false
                // 不再修改文档状态
                ElMessage.success(`已取消发布: ${doc.name}`)
              } else {
                ElMessage.error(`取消发布失败: ${response.data?.message || '未知错误'}`)
              }
            })
            .catch(error => {
              console.error('取消发布知识文件失败:', error)
              ElMessage.error(`取消发布失败: ${error.message || '未知错误'}`)
            })
            .finally(() => {
              loading.value = false
            })
        } else {
          ElMessage.warning('文件夹不支持此操作')
        }
      }).catch(() => {})
      break
    case 'delete':
      console.log('删除文档:', doc.name)
      ElMessageBox.confirm(`确定要删除 "${doc.name}" 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 如果是文件夹(知识集)，调用删除知识集API
        if (doc.isFolder) {
          loading.value = true
          deleteKnowledgeSet(doc.id, 1)
            .then(response => {
              if (response.data && response.data.code === 200) {
                // 从文档列表中删除该文档
                const index = documents.value.findIndex(item => item.id === doc.id)
                if (index !== -1) {
                  documents.value.splice(index, 1)
                  ElMessage.success(`已删除: ${doc.name}`)
                }
              } else {
                ElMessage.error(`删除失败: ${response.data?.message || '未知错误'}`)
              }
            })
            .catch(error => {
              console.error('删除知识集失败:', error)
              ElMessage.error(`删除失败: ${error.message || '未知错误'}`)
            })
            .finally(() => {
              loading.value = false
            })
        } else {
          // 调用deleteKnowledge API删除知识文件
          loading.value = true
          deleteKnowledge(1, doc.parentId, doc.id)
            .then(response => {
              if (response.data && response.data.code === 200) {
                // 从文档列表中删除该文档
                const index = documents.value.findIndex(item => item.id === doc.id)
                if (index !== -1) {
                  documents.value.splice(index, 1)
                  ElMessage.success(`已删除: ${doc.name}`)
                }
              } else {
                ElMessage.error(`删除失败: ${response.data?.message || '未知错误'}`)
              }
            })
            .catch(error => {
              console.error('删除知识文件失败:', error)
              ElMessage.error(`删除失败: ${error.message || '未知错误'}`)
            })
            .finally(() => {
              loading.value = false
            })
        }
      }).catch(() => {})
      break
  }
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  console.log('每页显示:', size)
  // 实际应用中应重新加载数据
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  console.log('当前页:', page)
  // 实际应用中应重新加载数据
}

// 显示上传对话框
const showUploadDialog = () => {
  uploadDialogVisible.value = true
  uploadForm.category = ''
  uploadForm.tags = []
  uploadForm.description = ''
  uploadFiles.value = []
}

// 处理文件变更
const handleFileChange = (file: any) => {
  console.log('选择文件:', file)
  // 实际应用中应处理文件变更
}

// 上传文档
const uploadDocuments = () => {
  console.log('上传文档:', uploadFiles.value)
  console.log('分类:', uploadForm.category)
  console.log('标签:', uploadForm.tags)
  console.log('描述:', uploadForm.description)
  
  ElMessage.success('文档上传成功')
  uploadDialogVisible.value = false
  // 实际应用中应调用API上传文档
}

// 创建新文件夹
const createNewFolder = () => {
  ElMessageBox.prompt('请输入文件夹名称', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: ''
  }).then(({ value }) => {
    if (value.trim()) {
      // 调用API创建知识集
      loading.value = true
      createKnowledgeSet(value, currentSpaceId.value)
        .then(response => {
          if (response.data && response.data.code === 200) {
            // 获取当前时间作为创建时间
            const currentTime = new Date().toISOString();
            // 添加到文档列表
            const newFolder = {
              id: response.data.data.id || Math.max(...documents.value.map(doc => doc.id)) + 1,
              name: value,
              type: 'folder',
              size: 0,
              lastModified: new Date(),
              createdAt: new Date(),
              createTime: currentTime, // 添加createTime字段
              updateTime: currentTime, // 添加updateTime字段
              category: 1, // 默认分类
              tags: [],
              isFolder: true,
              isNew: false,
              parentId: currentPath.value.length > 0 ? currentPath.value[currentPath.value.length - 1].id : null,
              summary: '',
              versions: []
            }
            
            // 添加到文档列表顶部
            documents.value.unshift(newFolder)
            ElMessage.success(`已创建文件夹: ${value}`)
          } else {
            ElMessage.error(`创建文件夹失败: ${response.data?.message || '未知错误'}`)
          }
        })
        .catch(error => {
          console.error('创建文件夹失败:', error)
          ElMessage.error(`创建文件夹失败: ${error.message || '未知错误'}`)
        })
        .finally(() => {
          loading.value = false
        })
    }
  }).catch(() => {})
}

// 显示创建分类对话框
const showCreateCategory = () => {
  ElMessageBox.prompt('请输入分类名称', '创建新分类', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    if (value.trim()) {
      ElMessage.success(`已创建分类: ${value}`)
      // 实际应用中应调用API创建分类
    }
  }).catch(() => {})
}

// 显示版本历史
const showVersionHistory = (doc: any) => {
  currentDocument.value = doc
  versionHistoryVisible.value = true
}

// 预览版本
const previewVersion = (version: any) => {
  console.log('预览版本:', version.versionNumber)
  ElMessage.info(`预览版本: ${version.versionNumber}`)
  // 实际应用中应跳转到文档预览页面
}

// 下载版本
const downloadVersion = (version: any) => {
  console.log('下载版本:', version.versionNumber)
  ElMessage.success(`正在下载版本: ${version.versionNumber}`)
  // 实际应用中应下载指定版本
}

// 恢复版本
const restoreVersion = (version: any) => {
  console.log('恢复版本:', version.versionNumber)
  ElMessageBox.confirm(`确定要恢复到版本 ${version.versionNumber} 吗？`, '确认恢复', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`已恢复到版本: ${version.versionNumber}`)
    // 实际应用中应调用API恢复版本
  }).catch(() => {})
}

// 学习与成长页面数据
const learningActiveTab = ref('plans')
const planStatusFilter = ref('')
const planSortOption = ref('created')
const planSearchKeyword = ref('')
const learningLoading = ref(false)
const learningPlanDetailVisible = ref(false)
const currentLearningPlan = ref<any>(null)
const recommendationType = ref('plan-based')



// 过滤后的学习计划 (根据搜索关键字和状态)
const filteredLearningPlans = computed(() => {
  let result = learningPlans.value
  
  // 搜索关键字过滤
  if (planSearchKeyword.value) {
    const keyword = planSearchKeyword.value.toLowerCase()
    result = result.filter(plan => 
      plan.title.toLowerCase().includes(keyword) || 
      plan.description.toLowerCase().includes(keyword)
    )
  }
  
  // 状态过滤
  if (planStatusFilter.value) {
    result = result.filter(plan => plan.status === planStatusFilter.value)
  }
  
  // 排序
  result = [...result].sort((a, b) => {
    switch (planSortOption.value) {
      case 'updated':
        // 这里应该根据最后更新时间排序，暂时使用id来模拟
        return b.id - a.id
      case 'deadline':
        return new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      case 'completion':
        const rateA = a.completedItems / a.totalItems
        const rateB = b.completedItems / b.totalItems
        return rateB - rateA
      case 'created':
      default:
        return b.id - a.id
    }
  })
  
  return result
})

// 基于学习计划的推荐资源
const planBasedRecommendations = ref([])

// 基于兴趣的推荐资源
const interestBasedRecommendations = ref([])

// 知识领域
const knowledgeDomains = ref([
  { id: 1, name: '前端开发' },
  { id: 2, name: '后端开发' },
  { id: 3, name: '移动开发' },
  { id: 4, name: '数据库' },
  { id: 5, name: '人工智能' },
  { id: 6, name: '设计与用户体验' }
])

// 知识图谱
const selectedDomains = ref([1, 2])
const knowledgeMapChart = ref(null)

// 学习与成长功能方法

const refreshLearningData = () => {
  ElMessage.success('刷新学习数据')
  // 实际应用中应重新加载学习数据
}



// 协作与分享页面数据
// const sharingActiveTab = ref('my-shares')
// const shareTypeFilter = ref('')
// const shareStatusFilter = ref('')
// const shareSearchKeyword = ref('')
// const sharingLoading = ref(false)
// const shareDialogVisible = ref(false)
// const shareForm = reactive({
//   contentType: 'document',
//   contentId: '',
//   shareTargets: ['private'], // 分享目标：个人链接、团队知识库、社区交流
//   teamId: '', // 团队ID
//   communityCategory: '', // 社区分类
//   communityTags: [] as string[], // 社区标签
//   isPublic: true,
//   expiryOption: '7days',
//   expiryDate: new Date(),
//   password: '',
//   sharedUsers: [] as number[],
//   description: ''
// })

// 模拟团队列表数据
const teamList = ref([
  { id: 1, name: '产品研发团队' },
  { id: 2, name: '技术架构组' },
  { id: 3, name: '数据分析团队' },
  { id: 4, name: 'UI/UX设计团队' }
])

// 可分享内容
const availableShareContent = computed(() => {
  // 根据选中的contentType返回不同的内容列表
  switch (shareForm.contentType) {
    case 'document':
      return documents.value.filter(doc => !doc.isFolder).map(doc => ({
        id: doc.id,
        title: doc.name
      }))
    case 'folder':
      return documents.value.filter(doc => doc.isFolder).map(doc => ({
        id: doc.id,
        title: doc.name
      }))
    case 'learning-plan':
      return learningPlans.value.map(plan => ({
        id: plan.id,
        title: plan.title
      }))
    case 'knowledge-map':
      return knowledgeDomains.value.map(domain => ({
        id: domain.id,
        title: domain.name
      }))
    default:
      return []
  }
})

const userList = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' }
])
const shareCurrentPage = ref(1)
const sharePageSize = ref(10)
const totalSharesCount = computed(() => filteredShares.value.length)

// 模拟分享内容数据
const myShares = ref([
  {
    id: 1,
    title: '产品需求规格说明书',
    type: 'document',
    sharedAt: new Date(2023, 8, 20, 14, 30),
    expiryDate: new Date(2023, 10, 20),
    views: 15,
    isPublic: true,
    link: 'https://share.example.com/doc/12345'
  },
  {
    id: 2,
    title: '团队会议纪要',
    type: 'folder',
    sharedAt: new Date(2023, 8, 18, 9, 45),
    expiryDate: new Date(2023, 11, 18),
    views: 8,
    isPublic: false,
    link: 'https://share.example.com/folder/67890'
  },
  {
    id: 3,
    title: 'Vue3 + TypeScript 学习',
    type: 'learning-plan',
    sharedAt: new Date(2023, 8, 15, 16, 20),
    expiryDate: new Date(2023, 9, 15),
    views: 12,
    isPublic: true,
    link: 'https://share.example.com/plan/24680'
  }
])

// 共享给我的内容
const sharedWithMeList = ref([])

// 定义分享对象类型
interface ShareItem {
  id: number;
  title: string;
  type: string;
  sharedAt: Date;
  expiryDate: Date;
  views: number;
  isPublic: boolean;
  link: string;
}

// 处理分享列表
const filteredShares = computed(() => {
  let result = myShares.value
  
  // 搜索关键字过滤
  if (shareSearchKeyword.value) {
    const keyword = shareSearchKeyword.value.toLowerCase()
    result = result.filter(share => 
      share.title.toLowerCase().includes(keyword)
    )
  }
  
  // 类型过滤
  if (shareTypeFilter.value) {
    result = result.filter(share => share.type === shareTypeFilter.value)
  }
  
  // 状态过滤
  if (shareStatusFilter.value) {
    const today = new Date()
    switch (shareStatusFilter.value) {
      case 'active':
        result = result.filter(share => !isAfter(today, share.expiryDate))
        break
      case 'expired':
        result = result.filter(share => isAfter(today, share.expiryDate))
        break
      // 其他状态过滤逻辑
    }
  }
  
  return result
})

// 处理分享列表大小变化
const handleShareSizeChange = (size: number) => {
  sharePageSize.value = size
  console.log('每页显示:', size)
  // 实际应用中应重新加载数据
}

// 处理分享列表当前页变化
const handleShareCurrentChange = (page: number) => {
  shareCurrentPage.value = page
  console.log('当前页:', page)
  // 实际应用中应重新加载数据
}

// 刷新分享数据
const refreshSharingData = () => {
  sharingLoading.value = true
  setTimeout(() => {
    sharingLoading.value = false
    ElMessage.success('分享数据已刷新')
  }, 1000)
  // 实际应用中应调用API刷新数据
}

// 过滤分享列表
const filterShares = () => {
  console.log('过滤分享 - 类型:', shareTypeFilter.value, '状态:', shareStatusFilter.value)
  // 实际应用中应调用API过滤分享
}

// 搜索分享
const searchShares = () => {
  console.log('搜索分享:', shareSearchKeyword.value)
  // 实际应用中应调用API搜索分享
}

// 显示分享内容对话框
const showShareContentDialog = () => {
  shareDialogVisible.value = true
  shareForm.contentType = 'document'
  shareForm.contentId = ''
  shareForm.shareTargets = ['private'] // 默认选择个人链接
  shareForm.teamId = ''
  shareForm.communityCategory = ''
  shareForm.isPublic = true
  shareForm.expiryOption = '7days'
  shareForm.expiryDate = new Date()
  shareForm.password = ''
  shareForm.sharedUsers = []
  shareForm.description = ''
}

// 处理分享内容
const submitShareContent = () => {
  console.log('分享内容:', shareForm)
  
  // 检查分享目标
  if (shareForm.shareTargets.length === 0) {
    ElMessage.warning('请至少选择一个分享位置')
    return
  }
  
  // 团队知识库分享检查
  if (shareForm.shareTargets.includes('team') && !shareForm.teamId) {
    ElMessage.warning('请选择要分享到的团队')
    return
  }
  
  // 社区分享检查
  if (shareForm.shareTargets.includes('community')) {
    if (!shareForm.communityCategory) {
      ElMessage.warning('请选择社区分类')
      return
    }
    if (shareForm.communityTags.length === 0) {
      ElMessage.warning('请至少添加一个社区标签')
      return
    }
  }
  
  // 构建成功消息
  const targetMessages: string[] = []
  if (shareForm.shareTargets.includes('private')) {
    targetMessages.push('生成个人分享链接')
  }
  if (shareForm.shareTargets.includes('team')) {
    const team = teamList.value.find(t => t.id.toString() === shareForm.teamId.toString())
    targetMessages.push(`团队知识库「${team?.name || '未知团队'}」`)
  }
  if (shareForm.shareTargets.includes('community')) {
    targetMessages.push('社区交流平台')
  }
  
  ElMessage.success(`内容已成功分享到: ${targetMessages.join(', ')}`)
  
  // 实际应用中应调用API保存分享内容
  shareDialogVisible.value = false
}

// 获取分享类型图标
const getShareTypeIcon = (type: string): any => {
  const iconMap: Record<string, any> = {
    'document': Document,
    'folder': FolderOpened,
    'learning-plan': Calendar,
    'knowledge-map': Lightning
  }
  return iconMap[type] || Document
}

// 获取分享类型名称
const getShareTypeName = (type: string): string => {
  const nameMap: Record<string, string> = {
    'document': '文档',
    'folder': '文件夹',
    'learning-plan': '学习计划',
    'knowledge-map': '知识图谱'
  }
  return nameMap[type] || '未知类型'
}

// 获取分享类型标签
const getShareTypeTag = (type: string): string => {
  const tagMap: Record<string, string> = {
    'document': 'success',
    'folder': 'info',
    'learning-plan': 'warning',
    'knowledge-map': 'danger'
  }
  return tagMap[type] || 'info'
}

// 检查分享是否已过期
const isShareExpired = (share: ShareItem): boolean => {
  const today = new Date()
  return isAfter(today, share.expiryDate)
}

// 获取分享有效期文本
const getShareExpiryText = (share: ShareItem): string => {
  const expiryDate = new Date(share.expiryDate)
  const today = new Date()
  const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft > 0) {
    return `有效期至 ${format(expiryDate, 'MM-dd')}，还有 ${daysLeft} 天`
  } else {
    return '已过期'
  }
}

// 查看共享内容
const viewSharedContent = (share: ShareItem) => {
  console.log('查看共享内容:', share.title)
  // 实际应用中应跳转到共享内容查看页面
}

// 复制分享链接
const copyShareLink = (share: ShareItem) => {
  console.log('复制分享链接:', share.link)
  // 实际应用中应复制分享链接
}

// 编辑分享权限
const editSharePermissions = (share: ShareItem) => {
  console.log('编辑分享权限:', share.title)
  // 实际应用中应跳转到分享权限编辑页面
}

// 取消分享
const unshareContent = (share: ShareItem) => {
  console.log('取消分享:', share.title)
  // 实际应用中应调用API取消分享
}

// 获取当前位置文件列表（文件夹优先）
const currentLocationDocuments = computed(() => {
  // 如果是搜索模式，直接返回所有文档
  if (isSearchMode.value) {
    return documents.value;
  }
  
  // 普通模式，按路径筛选文档
  let result = documents.value.filter(doc => {
    // 如果在根目录，只显示文件夹
    if (currentPath.value.length === 0) {
      return !doc.parentId && doc.isFolder;
    } 
    // 如果在某个文件夹内，显示该文件夹下的文档
    return doc.parentId === currentPath.value[currentPath.value.length - 1].id;
  });
  
  // 文件夹排在前面
  return [...result].sort((a, b) => {
    // 先按文件夹/文件排序
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    
    // 再按其他条件排序
    switch (sortOption.value) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      case 'createdAt':
        // 确保按创建时间降序排序
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'lastModified':
      default:
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    }
  });
})

// 显示知识摘要
const showKnowledgeSummary = (doc: any) => {
  currentDocument.value = doc
  currentKnowledgeSummary.value = doc.summary
  knowledgeSummaryVisible.value = true
}

// 查看完整文档
const viewFullDocument = () => {
  // 确保有当前文档
  if (currentDocument.value) {
    // 如果文档已经包含内容（搜索结果中），直接显示
    if (currentDocument.value.content) {
      currentDocumentContent.value = currentDocument.value.content;
      knowledgeSummaryVisible.value = false;
      documentContentVisible.value = true;
      return;
    }

    // 否则，从API获取内容
    loading.value = true;
    const spaceId = currentSpaceId.value;
    const setId = currentDocument.value.parentId || 0;
    const knowledgeId = currentDocument.value.id;
    
    getKnowledge(spaceId, setId, knowledgeId)
      .then((response: any) => {
        if (response.data && response.data.code === 200 && response.data.data) {
          const details = response.data.data;
          if (details.content) {
            currentDocumentContent.value = details.content;
            knowledgeSummaryVisible.value = false;
            documentContentVisible.value = true;
          } else {
            ElMessage.warning('该文档没有内容');
          }
        } else {
          ElMessage.error('获取文档内容失败');
        }
      })
      .catch(() => {
        ElMessage.error('获取文档内容失败');
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

// 返回上一页
const navigateBack = () => {
  currentPath.value = currentPath.value.slice(0, -1)
  console.log('返回上一页')
  // 实际应用中应重新加载当前路径的文档
}

const editTagsDialogVisible = ref(false)
const selectedDocumentTags = ref<number[]>([])
const moveDialogVisible = ref(false)
const selectedFolderId = ref<number | null>(null)
const folderTreeRef = ref<any>(null)

// 显示编辑标签对话框
const showEditTagsDialog = (doc: any) => {
  currentDocument.value = doc
  selectedDocumentTags.value = [...doc.tags] // 复制标签数组
  editTagsDialogVisible.value = true
}

// 切换文档标签
const toggleDocumentTag = (tagId: number) => {
  const index = selectedDocumentTags.value.indexOf(tagId)
  if (index === -1) {
    selectedDocumentTags.value.push(tagId)
  } else {
    selectedDocumentTags.value.splice(index, 1)
  }
}

// 保存文档标签
const saveDocumentTags = () => {
  if (!currentDocument.value) return
  
  // 更新文档标签
  const docIndex = documents.value.findIndex(d => d.id === currentDocument.value?.id)
  if (docIndex !== -1) {
    documents.value[docIndex].tags = [...selectedDocumentTags.value]
    
    ElMessage.success(`已更新"${currentDocument.value.name}"的标签`)
    editTagsDialogVisible.value = false
    
    // 在实际应用中这里应该调用API保存标签更改
  }
}

// 显示移动对话框
const showMoveDialog = (doc: any) => {
  currentDocument.value = doc
  selectedFolderId.value = null
  moveDialogVisible.value = true
}

// 构建文件夹树数据
const folderTreeData = computed(() => {
  // 根目录
  const root = {
    id: 0,
    name: '根目录',
    children: [] as any[]
  }
  
  // 获取所有文件夹
  const folders = documents.value.filter(doc => doc.isFolder)
  
  // 构建一级文件夹
  const rootFolders = folders.filter(folder => folder.parentId === null)
  root.children = rootFolders.map(folder => ({
    id: folder.id,
    name: folder.name,
    children: []
  }))
  
  // 构建子文件夹
  const buildChildren = (parentFolder: any): Array<{ id: number; name: string; children: any[] }> => {
    const children = folders.filter(folder => folder.parentId === parentFolder.id)
    return children.map(child => ({
      id: child.id,
      name: child.name,
      children: buildChildren(child)
    }))
  }
  
  // 为每个一级文件夹构建子级
  root.children.forEach(folder => {
    folder.children = buildChildren(folder)
  })
  
  return [root]
})

// 处理文件夹选择
const handleFolderSelect = (folder: any) => {
  // 如果选择的文件夹是当前文档的父文件夹，不允许移动
  if (folder.id === currentDocument.value?.parentId) {
    ElMessage.warning('文档已经在该文件夹中')
    selectedFolderId.value = null
    return
  }
  
  // 不允许将文件夹移动到自己内部或其子文件夹内
  if (currentDocument.value?.isFolder) {
    const isChildFolder = (parentId: number | null): boolean => {
      if (parentId === currentDocument.value?.id) return true
      
      const parent = documents.value.find(doc => doc.id === parentId)
      if (!parent) return false
      
      return parent.parentId ? isChildFolder(parent.parentId) : false
    }
    
    if (folder.id !== 0 && isChildFolder(folder.id)) {
      ElMessage.warning('不能将文件夹移动到其自身或子文件夹内')
      selectedFolderId.value = null
      return
    }
  }
  
  selectedFolderId.value = folder.id
}

// 获取选中文件夹的完整路径
const getSelectedFolderPath = computed(() => {
  if (selectedFolderId.value === null) return ''
  if (selectedFolderId.value === 0) return '根目录'
  
  const getPath = (folderId: number): string => {
    const folder = documents.value.find(doc => doc.id === folderId)
    if (!folder) return ''
    
    if (folder.parentId === null) {
      return folder.name
    } else {
      return `${getPath(folder.parentId)} / ${folder.name}`
    }
  }
  
  return getPath(selectedFolderId.value)
})

// 移动文档
const moveDocument = () => {
  if (!currentDocument.value || selectedFolderId.value === null) return
  
  // 更新文档的父文件夹ID
  const docIndex = documents.value.findIndex(doc => doc.id === currentDocument.value?.id)
  if (docIndex !== -1) {
    // 设置新的父文件夹ID（如果是0，则移动到根目录，即null）
    documents.value[docIndex].parentId = selectedFolderId.value === 0 ? null : selectedFolderId.value
    
    ElMessage.success(`已将"${currentDocument.value.name}"移动到${getSelectedFolderPath.value}`)
    moveDialogVisible.value = false
    
    // 在实际应用中这里应该调用API保存移动操作
  }
}

// 确保组件激活时图表显示
watch(() => activeTab.value, (newValue) => {
  if (newValue === 'dashboard') {
    nextTick(() => {
      // 如果切换到工作台，确保图表显示
      setTimeout(() => {
        initContributionChart()
      }, 100)
    })
  }
})

const manageFavoritesVisible = ref(false)
const favoritesTabActive = ref('current')
const favoritesLoading = ref(false)
const favoriteSearchKeyword = ref('')

// 显示管理收藏对话框
const showManageFavorites = () => {
  manageFavoritesVisible.value = true
  favoritesLoading.value = true
  
  // 调用收藏夹API获取数据
  getUserFavoriteFolders()
    .then((response: any) => {
      if (response.data && response.data.code === 200) {
        // 处理返回的收藏夹数据
        const data = response.data.data;
        if (data && data.length > 0) {
          // 格式化API返回的数据
          const formattedFolders = data.map((item: any) => {
            // 只保留有数据的字段
            const folder: any = {
              id: item.id || 0,
              title: item.name || '',
              type: 'folder',
              favoriteTime: new Date(),
              isFolder: true,
              parentId: null
            };
            
            // 有名称时添加
            if (item.name) {
              folder.name = item.name;
            }
            
            // 有收藏数量时添加
            if (typeof item.favouriteCount === 'number') {
              folder.favouriteCount = item.favouriteCount;
            }
            
            // 有摘要时添加
            if (item.summary) {
              folder.summary = item.summary;
            }
            
            return folder;
          });
          
          // 更新收藏文档列表，替换现有的文件夹
          // 先过滤掉所有文件夹，保留非文件夹项目
          const nonFolderItems = favoriteDocuments.value.filter(item => !item.isFolder);
          // 然后添加API返回的文件夹
          favoriteDocuments.value = [...formattedFolders, ...nonFolderItems];
          
          ElMessage.success('收藏夹数据加载成功');
        } else {
          // 如果API返回数据为空，保持使用静态数据
          ElMessage.info('没有找到收藏夹数据，使用默认数据');
        }
      } else {
        // 接口调用失败时使用静态数据
        ElMessage.warning('获取收藏夹数据失败，使用默认数据');
      }
    })
    .catch((error: any) => {
      console.error('获取收藏夹失败:', error);
      ElMessage.error('获取收藏夹数据出错，使用默认数据');
    })
    .finally(() => {
      favoritesLoading.value = false;
    });
}

// 获取文档类型名称
const getDocumentTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'docx': '文档',
    'pdf': 'PDF',
    'xlsx': '表格',
    'pptx': '演示文稿',
    'md': 'Markdown',
    'txt': '文本',
    'png': '图片',
    'jpg': '图片',
    'gif': '图片',
    'folder': '文件夹'
  }
  
  return typeMap[type] || '其他'
}

// 从收藏中移除
const removeFavorite = (doc: any) => {
  ElMessageBox.confirm(`确定要从收藏中移除"${doc.title}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
  }).then(() => {
    const index = favoriteDocuments.value.findIndex(item => item.id === doc.id)
    if (index !== -1) {
      favoriteDocuments.value.splice(index, 1)
      ElMessage.success('已从收藏中移除')
      
      // 实际应用中应调用API从收藏中移除
    }
  }).catch(() => {})
}

// 搜索可添加收藏的文档
const searchForFavorites = () => {
  favoritesLoading.value = true
  
  // 模拟搜索延迟
  setTimeout(() => {
    favoritesLoading.value = false
  }, 300)
}

// 非收藏文档列表（过滤后）
const filteredNonFavoriteDocuments = computed(() => {
  // 获取所有不是文件夹且不在收藏中的文档
  const favoriteIds = favoriteDocuments.value.map(doc => doc.id)
  let nonFavorites = documents.value.filter(doc => 
    !doc.isFolder && !favoriteIds.includes(doc.id)
  )
  
  // 按关键字过滤
  if (favoriteSearchKeyword.value) {
    const keyword = favoriteSearchKeyword.value.toLowerCase()
    nonFavorites = nonFavorites.filter(doc => 
      doc.name.toLowerCase().includes(keyword)
    )
  }
  
  return nonFavorites
})

// 添加到收藏
const addToFavorites = (doc: any) => {
  // 检查是否已经在收藏中
  const exists = favoriteDocuments.value.some(item => item.id === doc.id)
  if (exists) {
    ElMessage.warning('该文档已在收藏中')
    return
  }
  
  // 添加到收藏
  favoriteDocuments.value.push({
    id: doc.id,
    title: doc.name,
    type: doc.type,
    favoriteTime: new Date(),
    isFolder: doc.isFolder || false,
    parentId: null // 默认添加到根目录
  })
  
  ElMessage.success('已添加到收藏')
  // 切换到当前收藏标签页
  favoritesTabActive.value = 'current'
  
  // 实际应用中应调用API添加到收藏
}

// 新学习计划数据










// 协作与分享页面数据
const sharingActiveTab = ref('my-shares')
const shareTypeFilter = ref('')
const shareStatusFilter = ref('')
const shareSearchKeyword = ref('')
const sharingLoading = ref(false)
const shareDialogVisible = ref(false)
const shareForm = reactive({
  contentType: 'document',
  contentId: '',
  shareTargets: ['private'], // 分享目标：个人链接、团队知识库、社区交流
  teamId: '', // 团队ID
  communityCategory: '', // 社区分类
  communityTags: [] as string[], // 社区标签
  isPublic: true,
  expiryOption: '7days',
  expiryDate: new Date(),
  password: '',
  sharedUsers: [] as number[],
  description: ''
})

// 模拟团队列表数据
const teamList1 = ref([
  { id: 1, name: '产品研发团队' },
  { id: 2, name: '技术架构组' },
  { id: 3, name: '数据分析团队' },
  { id: 4, name: 'UI/UX设计团队' }
])

// 可分享内容
const availableShareContent1= computed(() => {
  // 根据选中的contentType返回不同的内容列表
  switch (shareForm.contentType) {
    case 'document':
      return documents.value.filter(doc => !doc.isFolder).map(doc => ({
        id: doc.id,
        title: doc.name
      }))
    case 'folder':
      return documents.value.filter(doc => doc.isFolder).map(doc => ({
        id: doc.id,
        title: doc.name
      }))
    case 'learning-plan':
      return learningPlans.value.map(plan => ({
        id: plan.id,
        title: plan.title
      }))
    case 'knowledge-map':
      return knowledgeDomains.value.map(domain => ({
        id: domain.id,
        title: domain.name
      }))
    default:
      return []
  }
})

const userList1 = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' }
])
const shareCurrentPage1 = ref(1)
const sharePageSize1 = ref(10)
const totalSharesCount1  = computed(() => filteredShares.value.length)

// 模拟分享内容数据
const myShares1 = ref([
  {
    id: 1,
    title: '产品需求规格说明书',
    type: 'document',
    sharedAt: new Date(2023, 8, 20, 14, 30),
    expiryDate: new Date(2023, 10, 20),
    views: 15,
    isPublic: true,
    link: 'https://share.example.com/doc/12345'
  },
  {
    id: 2,
    title: '团队会议纪要',
    type: 'folder',
    sharedAt: new Date(2023, 8, 18, 9, 45),
    expiryDate: new Date(2023, 11, 18),
    views: 8,
    isPublic: false,
    link: 'https://share.example.com/folder/67890'
  },
  {
    id: 3,
    title: 'Vue3 + TypeScript 学习',
    type: 'learning-plan',
    sharedAt: new Date(2023, 8, 15, 16, 20),
    expiryDate: new Date(2023, 9, 15),
    views: 12,
    isPublic: true,
    link: 'https://share.example.com/plan/24680'
  }
])

// 定义分享对象类型
interface ShareItem {
  id: number;
  title: string;
  type: string;
  sharedAt: Date;
  expiryDate: Date;
  views: number;
  isPublic: boolean;
  link: string;
}

// 处理分享列表
const filteredShares1 = computed(() => {
  let result = myShares1.value
  
  // 搜索关键字过滤
  if (shareSearchKeyword.value) {
    const keyword = shareSearchKeyword.value.toLowerCase()
    result = result.filter(share => 
      share.title.toLowerCase().includes(keyword)
    )
  }
  
  // 类型过滤
  if (shareTypeFilter.value) {
    result = result.filter(share => share.type === shareTypeFilter.value)
  }
  
  // 状态过滤
  if (shareStatusFilter.value) {
    const today = new Date()
    switch (shareStatusFilter.value) {
      case 'active':
        result = result.filter(share => !isAfter(today, share.expiryDate))
        break
      case 'expired':
        result = result.filter(share => isAfter(today, share.expiryDate))
        break
      // 其他状态过滤逻辑
    }
  }
  
  return result
})

// 处理分享列表大小变化
const handleShareSizeChange1 = (size: number) => {
  sharePageSize1.value = size
  console.log('每页显示:', size)
  // 实际应用中应重新加载数据
}

// 处理分享列表当前页变化
const handleShareCurrentChange1 = (page: number) => {
  shareCurrentPage1.value = page
  console.log('当前页:', page)
  // 实际应用中应重新加载数据
}

// 刷新分享数据
const refreshSharingData1 = () => {
  sharingLoading.value = true
  setTimeout(() => {
    sharingLoading.value = false
    ElMessage.success('分享数据已刷新')
  }, 1000)
  // 实际应用中应调用API刷新数据
}

// 过滤分享列表
const filterShares1 = () => {
  console.log('过滤分享 - 类型:', shareTypeFilter.value, '状态:', shareStatusFilter.value)
  // 实际应用中应调用API过滤分享
}

// 搜索分享
const searchShares1 = () => {
  console.log('搜索分享:', shareSearchKeyword.value)
  // 实际应用中应调用API搜索分享
}

// 显示分享内容对话框
const showShareContentDialog1 = () => {
  shareDialogVisible.value = true
  shareForm.contentType = 'document'
  shareForm.contentId = ''
  shareForm.shareTargets = ['private'] // 默认选择个人链接
  shareForm.teamId = ''
  shareForm.communityCategory = ''
  shareForm.isPublic = true
  shareForm.expiryOption = '7days'
  shareForm.expiryDate = new Date()
  shareForm.password = ''
  shareForm.sharedUsers = []
  shareForm.description = ''
}

// 处理分享内容
const submitShareContent1 = () => {
  console.log('分享内容:', shareForm1)
  
  // 检查分享目标
  if (shareForm.shareTargets.length === 0) {
    ElMessage.warning('请至少选择一个分享位置')
    return
  }
  
  // 团队知识库分享检查
  if (shareForm.shareTargets.includes('team') && !shareForm.teamId) {
    ElMessage.warning('请选择要分享到的团队')
    return
  }
  
  // 社区分享检查
  if (shareForm.shareTargets.includes('community')) {
    if (!shareForm.communityCategory) {
      ElMessage.warning('请选择社区分类')
      return
    }
    if (shareForm.communityTags.length === 0) {
      ElMessage.warning('请至少添加一个社区标签')
      return
    }
  }
  
  // 构建成功消息
  const targetMessages: string[] = []
  if (shareForm.shareTargets.includes('private')) {
    targetMessages.push('生成个人分享链接')
  }
  if (shareForm.shareTargets.includes('team')) {
    const team = teamList.value.find(t => t.id.toString() === shareForm.teamId.toString())
    targetMessages.push(`团队知识库「${team?.name || '未知团队'}」`)
  }
  if (shareForm.shareTargets.includes('community')) {
    targetMessages.push('社区交流平台')
  }
  
  ElMessage.success(`内容已成功分享到: ${targetMessages.join(', ')}`)
  
  // 实际应用中应调用API保存分享内容
  shareDialogVisible.value = false
}

// 获取分享类型图标
const getShareTypeIcon1 = (type: string): any => {
  const iconMap: Record<string, any> = {
    'document': Document,
    'folder': FolderOpened,
    'learning-plan': Calendar,
    'knowledge-map': Lightning
  }
  return iconMap[type] || Document
}

// 获取分享类型名称
const getShareTypeName1 = (type: string): string => {
  const nameMap: Record<string, string> = {
    'document': '文档',
    'folder': '文件夹',
    'learning-plan': '学习计划',
    'knowledge-map': '知识图谱'
  }
  return nameMap[type] || '未知类型'
}

// 获取分享类型标签
const getShareTypeTag1 = (type: string): string => {
  const tagMap: Record<string, string> = {
    'document': 'success',
    'folder': 'info',
    'learning-plan': 'warning',
    'knowledge-map': 'danger'
  }
  return tagMap[type] || 'info'
}

// 检查分享是否已过期
const isShareExpired1 = (share: ShareItem): boolean => {
  const today = new Date()
  return isAfter(today, share.expiryDate)
}

// 获取分享有效期文本
const getShareExpiryText1 = (share: ShareItem): string => {
  const expiryDate = new Date(share.expiryDate)
  const today = new Date()
  const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft > 0) {
    return `有效期至 ${format(expiryDate, 'MM-dd')}，还有 ${daysLeft} 天`
  } else {
    return '已过期'
  }
}

// 查看共享内容
const viewSharedContent1 = (share: ShareItem) => {
  console.log('查看共享内容:', share.title)
  // 实际应用中应跳转到共享内容查看页面
}

// 复制分享链接
const copyShareLink1 = (share: ShareItem) => {
  console.log('复制分享链接:', share.link)
  // 实际应用中应复制分享链接
}

// 编辑分享权限
const editSharePermissions1 = (share: ShareItem) => {
  console.log('编辑分享权限:', share.title)
  // 实际应用中应跳转到分享权限编辑页面
}

// 取消分享
const unshareContent1 = (share: ShareItem) => {
  console.log('取消分享:', share.title)
  // 实际应用中应调用API取消分享
}

// 获取当前位置文件列表（文件夹优先）
const currentLocationDocuments1 = computed(() => {
  let result = documents1.value.filter(doc => {
    // 如果在根目录，只显示文件夹
    if (currentPath1.value.length === 0) {
      return !doc.parentId && doc.isFolder;
    } 
    // 如果在某个文件夹内，显示该文件夹下的文档
    return doc.parentId === currentPath.value[currentPath.value.length - 1].id;
  });
  
  // 文件夹排在前面
  return [...result].sort((a, b) => {
    // 先按文件夹/文件排序
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    
    // 再按其他条件排序
    switch (sortOption.value) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'lastModified':
        default:
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    }
  });
})

// 查看完整文档
const viewFullDocument1 = () => {
  // 确保有当前文档
  if (currentDocument1.value) {
    openDocument1(currentDocument1.value)
    knowledgeSummaryVisible1.value = false
  }
}

// 返回上一页
const navigateBack1 = () => {
  currentPath1.value = currentPath1.value.slice(0, -1)
  console.log('返回上一页')
  // 实际应用中应重新加载当前路径的文档
}

const editTagsDialogVisible1 = ref(false)
const selectedDocumentTags1 = ref<number[]>([])
const moveDialogVisible1 = ref(false)
const selectedFolderId1 = ref<number | null>(null)
const folderTreeRef1 = ref<any>(null)

// 切换文档标签
const toggleDocumentTag1 = (tagId: number) => {
  const index = selectedDocumentTags1.value.indexOf(tagId)
  if (index === -1) {
    selectedDocumentTags1.value.push(tagId)
  } else {
    selectedDocumentTags.value.splice(index, 1)
  }
}

// 保存文档标签
const saveDocumentTags1 = () => {
  if (!currentDocument.value) return
  
  // 更新文档标签
  const docIndex = documents.value.findIndex(d => d.id === currentDocument.value?.id)
  if (docIndex !== -1) {
    documents.value[docIndex].tags = [...selectedDocumentTags.value]
    
    ElMessage.success(`已更新"${currentDocument.value.name}"的标签`)
    editTagsDialogVisible.value = false
    
    // 在实际应用中这里应该调用API保存标签更改
  }
}
// 构建文件夹树数据
const folderTreeData1 = computed(() => {
  // 根目录
  const root = {
    id: 0,
    name: '根目录',
    children: [] as any[]
  }
  
  // 获取所有文件夹
  const folders = documents.value.filter(doc => doc.isFolder)
  
  // 构建一级文件夹
  const rootFolders = folders.filter(folder => folder.parentId === null)
  root.children = rootFolders.map(folder => ({
    id: folder.id,
    name: folder.name,
    children: []
  }))
  
  // 构建子文件夹
  const buildChildren = (parentFolder: any): Array<{ id: number; name: string; children: any[] }> => {
    const children = folders.filter(folder => folder.parentId === parentFolder.id)
    return children.map(child => ({
      id: child.id,
      name: child.name,
      children: buildChildren(child)
    }))
  }
  
  // 为每个一级文件夹构建子级
  root.children.forEach(folder => {
    folder.children = buildChildren(folder)
  })
  
  return [root]
})

// 处理文件夹选择
const handleFolderSelect1 = (folder: any) => {
  // 如果选择的文件夹是当前文档的父文件夹，不允许移动
  if (folder.id === currentDocument1.value?.parentId) {
    ElMessage.warning('文档已经在该文件夹中')
    selectedFolderId.value = null
    return
  }
  
  // 不允许将文件夹移动到自己内部或其子文件夹内
  if (currentDocument.value?.isFolder) {
    const isChildFolder = (parentId: number | null): boolean => {
      if (parentId === currentDocument.value?.id) return true
      
      const parent = documents.value.find(doc => doc.id === parentId)
      if (!parent) return false
      
      return parent.parentId ? isChildFolder(parent.parentId) : false
    }
    
    if (folder.id !== 0 && isChildFolder(folder.id)) {
      ElMessage.warning('不能将文件夹移动到其自身或子文件夹内')
      selectedFolderId.value = null
      return
    }
  }
  
  selectedFolderId.value = folder.id
}

// 获取选中文件夹的完整路径
const getSelectedFolderPath1 = computed(() => {
  if (selectedFolderId1.value === null) return ''
  if (selectedFolderId1.value === 0) return '根目录'
  
  const getPath = (folderId: number): string => {
    const folder = documents.value.find(doc => doc.id === folderId)
    if (!folder) return ''
    
    if (folder.parentId === null) {
      return folder.name
    } else {
      return `${getPath(folder.parentId)} / ${folder.name}`
    }
  }
  
  return getPath(selectedFolderId.value)
})

// 移动文档
const moveDocument1 = () => {
  if (!currentDocument1.value || selectedFolderId1.value === null) return
  
  // 更新文档的父文件夹ID
  const docIndex = documents.value.findIndex(doc => doc.id === currentDocument.value?.id)
  if (docIndex !== -1) {
    // 设置新的父文件夹ID（如果是0，则移动到根目录，即null）
    documents.value[docIndex].parentId = selectedFolderId.value === 0 ? null : selectedFolderId.value
    
    ElMessage.success(`已将"${currentDocument.value.name}"移动到${getSelectedFolderPath.value}`)
    moveDialogVisible.value = false
    
    // 在实际应用中这里应该调用API保存移动操作
  }
}

// 确保组件激活时图表显示
watch(() => activeTab.value, (newValue) => {
  if (newValue === 'dashboard') {
    nextTick(() => {
      // 如果切换到工作台，确保图表显示
      setTimeout(() => {
        initContributionChart()
      }, 100)
    })
  }
})

const manageFavoritesVisible1 = ref(false)
const favoritesTabActive1 = ref('current')
const favoritesLoading1 = ref(false)
const favoriteSearchKeyword1 = ref('')

// 显示管理收藏对话框
const showManageFavorites1 = () => {
  manageFavoritesVisible1.value = true
  favoritesLoading1.value = true
  
  // 模拟加载数据
  setTimeout(() => {
    favoritesLoading.value = false
    }, 500)
  }

// 获取文档类型名称
const getDocumentTypeName1 = (type: string): string => {
  const typeMap: Record<string, string> = {
    'docx': '文档',
    'pdf': 'PDF',
    'xlsx': '表格',
    'pptx': '演示文稿',
    'md': 'Markdown',
    'txt': '文本',
    'png': '图片',
    'jpg': '图片',
    'gif': '图片',
    'folder': '文件夹'
  }
  
  return typeMap[type] || '其他'
}

// 搜索可添加收藏的文档
const searchForFavorites1 = () => {
  favoritesLoading1.value = true
  
  // 模拟搜索延迟
  setTimeout(() => {
    favoritesLoading1.value = false
  }, 300)
}

// 非收藏文档列表（过滤后）
const filteredNonFavoriteDocuments1 = computed(() => {
  // 获取所有不是文件夹且不在收藏中的文档
  const favoriteIds = favoriteDocuments1.value.map(doc => doc.id)
  let nonFavorites = documents1.value.filter(doc => 
    !doc.isFolder && !favoriteIds.includes(doc.id)
  )
  
  // 按关键字过滤
  if (favoriteSearchKeyword.value) {
    const keyword = favoriteSearchKeyword.value.toLowerCase()
    nonFavorites = nonFavorites.filter(doc => 
      doc.name.toLowerCase().includes(keyword)
    )
  }
  
  return nonFavorites
})
  // 实际应用中应调用API添加到收藏

// 创建学习计划相关变量和方法
const createLearningPlanVisible = ref(false)
const newLearningPlan = reactive({
  title: "",
  description: "",
  startDate: new Date(),
  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  items: [] as any[],
  tags: [] as string[]
})

const newLearningItem = reactive({
  title: "",
  description: "",
  estimatedTime: 1,
  priority: "medium",
  resources: [] as any[]
})

const newResource = reactive({
  title: "",
  type: "link",
  url: "",
  description: ""
})

// 学习项目表单控制
const showLearningItemForm = ref(false)
const showAddResource = ref(false)

// 学习计划数据
const learningPlans = ref([
  {
    id: 1,
    title: 'Vue3 + TypeScript学习',
    description: '系统学习Vue3和TypeScript，掌握前端开发技能',
    startDate: new Date('2023-11-01'),
    endDate: new Date('2023-12-31'),
    status: 'in-progress',
    progress: 35,
    tags: ['frontend', 'vue', 'typescript'],
    items: [
      {
        id: 101,
        title: 'Vue3基础知识',
        description: '学习Vue3基础知识和概念',
        priority: 'high',
        estimatedTime: 10,
        completed: true,
        resources: []
      },
      {
        id: 102,
        title: 'TypeScript基础',
        description: '学习TypeScript类型系统和基础语法',
        priority: 'high',
        estimatedTime: 8,
        completed: true,
        resources: []
      },
      {
        id: 103,
        title: 'Vue3组合式API',
        description: '学习Vue3组合式API的使用',
        priority: 'medium',
        estimatedTime: 12,
        completed: false,
        resources: []
      }
    ],
    createdAt: new Date('2023-10-28'),
    lastUpdated: new Date('2023-11-10')
  },
  {
    id: 2,
    title: '后端开发学习计划',
    description: '学习Node.js和Express框架，掌握后端开发能力',
    startDate: new Date('2023-10-15'),
    endDate: new Date('2024-01-15'),
    status: 'in-progress',
    progress: 20,
    tags: ['backend', 'nodejs', 'express'],
    items: [
      {
        id: 201,
        title: 'Node.js基础',
        description: '学习Node.js基础知识和概念',
        priority: 'high',
        estimatedTime: 15,
        completed: true,
        resources: []
      },
      {
        id: 202,
        title: 'Express框架学习',
        description: '学习Express框架的使用',
        priority: 'medium',
        estimatedTime: 10,
        completed: false,
        resources: []
      }
    ],
    createdAt: new Date('2023-10-10'),
    lastUpdated: new Date('2023-10-30')
  }
])

// 显示创建学习计划对话框
const showCreateLearningPlan = () => {
  // 清空表单
  createTaskForm.agencyName = '';
  createTaskForm.deadline = '';
  createTaskDialogVisible.value = true;
}

// 创建学习任务相关变量和对话框
const createTaskDialogVisible = ref(false);
const createTaskFormRef = ref<FormInstance>();
const createTaskForm = reactive({
  agencyName: '',
  deadline: ''
});
const createTaskRules = {
  agencyName: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { max: 100, message: '任务名称不能超过100个字符', trigger: 'blur' }
  ],
  deadline: [
    { required: true, message: '请选择截止时间', trigger: 'change' }
  ]
};

// 提交创建学习任务
const submitCreateTask = () => {
  if (!createTaskFormRef.value) return;
  
  createTaskFormRef.value.validate((valid) => {
    if (valid) {
      // 显示加载状态
      loading.value = true;
      
      // 格式化日期
      const deadlineStr = createTaskForm.deadline 
        ? new Date(createTaskForm.deadline).toISOString() 
        : '';
      
      // 调用创建学习任务的API
      createUserAgency({
        agencyName: createTaskForm.agencyName,
        deadline: deadlineStr
      })
        .then(response => {
          if (response.data && response.data.code === 200) {
            ElMessage.success(`学习任务"${createTaskForm.agencyName}"创建成功`);
            createTaskDialogVisible.value = false;
            
            // 刷新待办任务列表
            fetchPendingTasks();
          } else {
            ElMessage.error(response.data?.msg || '创建学习任务失败，请稍后重试');
          }
        })
        .catch(error => {
          console.error('创建学习任务失败:', error);
          ElMessage.error('创建学习任务失败，请稍后重试');
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
}

// 获取待办任务列表
const fetchPendingTasks = () => {
  // 此处添加获取待办任务的API调用
  // 实际项目中应根据具体情况调整
}

// 创建学习计划
const createLearningPlan = () => {
  if (!newLearningPlan.title) {
    ElMessage.warning('请输入学习计划名称')
    return
  }
  
  if (!newLearningPlan.startDate || !newLearningPlan.endDate) {
    ElMessage.warning('请选择计划周期')
    return
  }
  
  // 提交学习计划数据
  // 这里模拟添加计划
  const newPlan = {
    id: Date.now(),
    title: newLearningPlan.title,
    description: newLearningPlan.description,
    startDate: newLearningPlan.startDate,
    endDate: newLearningPlan.endDate,
    status: 'in-progress',
    progress: 0,
    tags: [...newLearningPlan.tags],
    items: [...newLearningPlan.items],
    createdAt: new Date(),
    lastUpdated: new Date()
  }
  
  // 添加学习计划到列表中
  learningPlans.value.unshift(newPlan)
  
  // 更新学习统计
  learningStats.totalPlans += 1
  
  // 关闭对话框
  createLearningPlanVisible.value = false
  
  ElMessage.success('学习计划创建成功')
}

// 添加学习项目
const addLearningItem = () => {
  showLearningItemForm.value = true
  // 重置表单
  newLearningItem.title = ""
  newLearningItem.description = ""
  newLearningItem.estimatedTime = 1
  newLearningItem.priority = "medium"
  newLearningItem.resources = []
}

// 确认添加学习项目
const confirmAddLearningItem = () => {
  if (!newLearningItem.title) {
    ElMessage.warning('请输入学习项目名称')
    return
  }
  
  newLearningPlan.items.push({
    id: Date.now(),
    title: newLearningItem.title,
    description: newLearningItem.description,
    priority: newLearningItem.priority,
    estimatedTime: newLearningItem.estimatedTime,
    completed: false,
    resources: [...newLearningItem.resources]
  })
  
  showLearningItemForm.value = false
}

// 取消添加学习项目
const cancelAddLearningItem = () => {
  showLearningItemForm.value = false
}

// 移除学习项目
const removeLearningItem = (index: number) => {
  newLearningPlan.items.splice(index, 1)
}

// 添加资源
const addResource = () => {
  if (!newResource.title) {
    ElMessage.warning('请输入资源名称')
    return
  }
  
  newLearningItem.resources.push({
    id: Date.now(),
    title: newResource.title,
    type: newResource.type,
    url: newResource.url,
    description: newResource.description
  })
  
  // 重置资源表单
  newResource.title = ""
  newResource.url = ""
  newResource.description = ""
  
  showAddResource.value = false
}

// 移除资源
const removeResource = (index: number) => {
  newLearningItem.resources.splice(index, 1)
}

// 获取优先级类型
const getPriorityType = (priority: string) => {
  switch (priority) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return 'info'
  }
}

// 获取优先级文本
const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '高优先级'
    case 'medium': return '中优先级'
    case 'low': return '低优先级'
    default: return '未设置'
  }
}

// 获取资源类型文本
const getResourceTypeText = (type: string) => {
  switch (type) {
    case 'link': return '网页链接'
    case 'video': return '视频教程'
    case 'ebook': return '电子书'
    case 'document': return '文档'
    case 'other': return '其他'
    default: return '未知类型'
  }
}

// 当前空间ID
const currentSpaceId = ref(1) // 默认空间ID为1，实际应用中应从用户数据或路由参数中获取

// 获取知识集列表
const fetchKnowledgeSets = () => {
  loading.value = true
  getKnowledgeSets(1)
    .then(response => {
      if (response.data && response.data.code === 200 && response.data.data) {
        // 处理返回的知识集数据
        const knowledgeSets = response.data.data || []
        // 将知识集数据转换为文档格式，并保留原始createTime字段
        documents.value = knowledgeSets.map((item: any) => ({
          id: item.id,
          name: item.name || '-',
          type: 'folder',
          size: 0,
          createdAt: item.createTime ? new Date(item.createTime) : new Date(),
          createTime: item.createTime, // 保存原始createTime字段
          updateTime: item.updateTime, // 保存原始updateTime字段
          category: item.category || 1,
          tags: item.tags || [],
          isFolder: true,
          parentId: null, // 在根目录
          summary: item.summary || '',
          versions: []
        }))
        
        // 按创建时间降序排序，使新创建的排在最前面
        documents.value.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      } else {
        ElMessage.error(`获取知识集列表失败: ${response.data?.message || '未知错误'}`)
      }
    })
    .catch(error => {
      console.error('获取知识集列表失败:', error)
      ElMessage.error(`获取知识集列表失败: ${error.message || '未知错误'}`)
    })
    .finally(() => {
      loading.value = false
    })
}

// 组件挂载时获取知识集列表
onMounted(() => {
  // 确保DOM渲染完成后初始化图表
  nextTick(() => {
    // 确保图表第一次也能正确渲染
    setTimeout(() => {
      initContributionChart()
    }, 100)
  })
  
  // 监听窗口大小变化，重绘图表
  window.addEventListener('resize', () => {
    if (contributionChartInstance) {
      contributionChartInstance.resize()
    }
  })
  
  // 获取知识集列表
  fetchKnowledgeSets()
  
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})

// 编辑知识对话框相关变量
const editKnowledgeDialogVisible = ref(false)
const editKnowledgeForm = reactive({
  id: 0,
  setId: 0,
  name: '',
  summary: '',
  tags: [] as number[],
  status: 1
})

// 处理编辑知识文件变更
const handleEditFileChange = (file: any) => {
  console.log('选择编辑文件:', file)
  // 实际应用中这里会处理文件上传预览等
}

// 显示编辑知识对话框
const showEditKnowledgeDialog = (doc: any) => {
  // 设置当前要编辑的文档
  currentDocument.value = doc
  
  // 设置表单初始值
  editKnowledgeForm.id = doc.id
  editKnowledgeForm.setId = doc.parentId || 0
  editKnowledgeForm.name = doc.name
  editKnowledgeForm.summary = doc.summary || ''
  editKnowledgeForm.tags = [...(doc.tags || [])]
  editKnowledgeForm.status = doc.status !== undefined ? doc.status : 1
  
  // 显示对话框
  editKnowledgeDialogVisible.value = true
}

// 提交编辑知识
const submitEditKnowledge = () => {
  if (!editKnowledgeForm.name.trim()) {
    ElMessage.warning('请输入知识名称');
    return;
  }
  
  // 构造更新参数
  const updateData = {
    name: editKnowledgeForm.name,
    summary: editKnowledgeForm.summary,
    status: editKnowledgeForm.status
  };
  
  // 显示加载状态
  loading.value = true;
  
  // 调用更新知识预览API
  updateKnowledgePreview(
    currentSpaceId.value, 
    editKnowledgeForm.setId, 
    editKnowledgeForm.id, 
    updateData
  )
    .then((response: any) => {
      if (response.data && response.data.code === 200) {
        // 更新本地数据
        const index = documents.value.findIndex(item => item.id === editKnowledgeForm.id);
        if (index !== -1) {
          documents.value[index].name = editKnowledgeForm.name;
          documents.value[index].summary = editKnowledgeForm.summary;
          documents.value[index].tags = [...editKnowledgeForm.tags];
          documents.value[index].status = editKnowledgeForm.status;
          
          // 如果有lastModified字段，更新它
          if ('lastModified' in documents.value[index]) {
            documents.value[index].lastModified = new Date();
          }
          
          // 如果有updateTime字段，更新它
          if ('updateTime' in documents.value[index]) {
            documents.value[index].updateTime = new Date().toISOString();
          }
        }
        
        ElMessage.success('知识更新成功');
        editKnowledgeDialogVisible.value = false;
      } else {
        ElMessage.error(`更新知识失败: ${response.data?.message || '未知错误'}`);
      }
    })
    .catch((error: any) => {
      console.error('更新知识失败:', error);
      ElMessage.error(`更新知识失败: ${error.message || '未知错误'}`);
    })
    .finally(() => {
      loading.value = false;
    });
}

// 新建知识对话框相关变量
const newKnowledgeDialogVisible = ref(false)
const newKnowledgeForm = reactive({
  name: '',
  file: null as File | null
})
const newKnowledgeFileList = ref<any[]>([])
const createKnowledgeLoading = ref(false)

// 处理新建知识文件选择
const handleNewKnowledgeFileChange = (file: any, fileList: any[]) => {
  newKnowledgeForm.file = file.raw
  newKnowledgeFileList.value = [file]
}
const handleRemoveNewKnowledgeFile = () => {
  newKnowledgeForm.file = null
  newKnowledgeFileList.value = []
}

// 显示新建知识对话框
const showNewKnowledgeDialog = () => {
  newKnowledgeDialogVisible.value = true
  newKnowledgeForm.name = ''
  newKnowledgeForm.file = null
  newKnowledgeFileList.value = []
}

// 创建新知识
const createNewKnowledge = () => {
  if (!newKnowledgeForm.name.trim()) {
    ElMessage.warning('请输入知识名称')
    return
  }
  if (!newKnowledgeForm.file) {
    ElMessage.warning('请上传知识文件')
    return
  }
  if (!currentPath.value.length) {
    ElMessage.warning('请先进入一个知识库')
    return
  }
  createKnowledgeLoading.value = true
  const setId = currentPath.value[currentPath.value.length - 1].id
  const spaceId = currentSpaceId.value || 1
  const formData = new FormData()
  formData.append('name', newKnowledgeForm.name)
  formData.append('file', newKnowledgeForm.file)
  createKnowledge(setId, 1, formData)
    .then(response => {
      if (response.data && response.data.code === 200) {
        ElMessage.success('新知识创建成功')
        newKnowledgeDialogVisible.value = false
        
        // 刷新当前文件夹的内容
        if (currentPath.value.length > 0) {
          const currentFolder = currentPath.value[currentPath.value.length - 1];
          getAllKnowledge(spaceId, currentFolder.id)
            .then(response => {
              if (response.data && response.data.code === 200) {
                // 处理返回的知识库内容数据
                if (response.data.data && Array.isArray(response.data.data)) {
                  // 将知识库中的文件添加到当前路径下
                  const knowledgeItems = response.data.data.map((item: any) => ({
                    id: item.id,
                    name: item.name || '-',
                    type: item.dataType === 1 ? 'doc' : 'other',
                    size: 0,
                    lastModified: item.updateTime ? new Date(item.updateTime) : new Date(),
                    createdAt: item.createTime ? new Date(item.createTime) : new Date(),
                    createTime: item.createTime,
                    updateTime: item.updateTime,
                    summary: item.summary || '-',
                    category: item.category || 1,
                    status: item.status !== undefined ? item.status : 1,
                    tags: item.tags || [],
                    isFolder: false,
                    isNew: false,
                    parentId: currentFolder.id,
                    content: item.content,
                    currentVersion: item.currentVersion,
                    versionCount: item.versionCount,
                    tagList: item.tagList || [],
                    versions: item.versionCount > 0 ? [{
                      id: item.id,
                      versionNumber: `v${item.currentVersion || '1.0'}`,
                      createdAt: item.updateTime || item.createTime || new Date(),
                      createdBy: '当前用户',
                      size: item.size || 0,
                      description: '当前版本'
                    }] : []
                  }));
                  
                  // 更新文档列表，保留原有文件夹，添加新的知识项
                  const existingDocs = documents.value.filter(item => !item.parentId || item.parentId !== currentFolder.id);
                  documents.value = [...existingDocs, ...knowledgeItems];
                }
              }
            })
            .catch(error => {
              console.error('刷新知识列表失败:', error);
            });
        }
      } else {
        ElMessage.error(`创建知识失败: ${response.data?.message || '未知错误'}`)
      }
    })
    .catch(error => {
      console.error('创建知识失败:', error)
      ElMessage.error(`创建知识失败: ${error.message || '未知错误'}`)
    })
    .finally(() => {
      createKnowledgeLoading.value = false
    })
}

  // 历史版本弹窗相关
  const historyVersionDialogVisible = ref(false)
  const historyVersions = ref<any[]>([])
  const historyLoading = ref(false)
  const currentHistoryDoc = ref<any>(null)

  // 查看历史版本
  const showHistoryVersions = async (doc: any) => {
    historyLoading.value = true
    currentHistoryDoc.value = doc
    try {
      const res = await getKnowledgeVersions(doc.id)
      if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
        historyVersions.value = res.data.data
      } else {
        historyVersions.value = []
      }
      historyVersionDialogVisible.value = true
    } catch (e) {
      historyVersions.value = []
      historyVersionDialogVisible.value = true
    } finally {
      historyLoading.value = false
    }
  }

  // 在<script setup>中添加方法：
  const goToAllKnowledge = () => {
    activeTab.value = 'documents';
    currentPath.value = [];
    isSearchMode.value = false;
    searchKeyword.value = '';
    // 可选：滚动到顶部
    nextTick(() => {
      window.scrollTo(0, 0);
    });
  };

  const handleRollbackVersion = async (version: any) => {
    if (!currentHistoryDoc.value) return
    historyLoading.value = true
    try {
      // 取 fileVersion 字段，去掉 'v' 并转为数字
      let versionId = version.fileVersion;
      if (typeof versionId === 'string' && versionId.startsWith('v')) {
        versionId = parseInt(versionId.replace('v', '').split('.')[0], 10);
      }
      // 兼容原有 id 字段
      if (!versionId && version.id) {
        versionId = version.id;
      }
      console.log('回滚参数', currentHistoryDoc.value.id, versionId, version);
      const res = await rollbackKnowledgeVersion(currentHistoryDoc.value.id, versionId)
      if (res.data && res.data.code === 200) {
        ElMessage.success('回滚成功')
        // 回滚后重新获取历史版本列表
        const versionRes = await getKnowledgeVersions(currentHistoryDoc.value.id)
        if (versionRes.data && versionRes.data.code === 200 && Array.isArray(versionRes.data.data)) {
          historyVersions.value = versionRes.data.data
        }
        // 刷新文档内容
        loadKnowledgeDetails(currentHistoryDoc.value)
        // 可选：关闭弹窗
        // historyVersionDialogVisible.value = false
      } else {
        ElMessage.error('回滚失败: ' + (res.data?.msg || '未知错误'))
      }
    } catch (e) {
      ElMessage.error('回滚失败')
    } finally {
      historyLoading.value = false
    }
  }

  // 收藏夹路径
  const currentFavoritePath = ref<{id: number, name: string}[]>([])

  // 获取当前收藏位置的内容
  const currentLocationFavorites = computed(() => {
    // 处理文件夹结构
    let result = favoriteDocuments.value.filter(item => {
      // 如果在根目录，只显示文件夹
      if (currentFavoritePath.value.length === 0) {
        return !item.parentId && item.isFolder;
      }
      // 如果在某个文件夹内，显示该文件夹下的内容
      return item.parentId === currentFavoritePath.value[currentFavoritePath.value.length - 1].id;
    });
    
    // 文件夹排在前面
    return [...result].sort((a, b) => {
      // 先按文件夹/文件排序
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      
      // 再按收藏时间排序
      const timeA = a.favoriteTime || new Date();
      const timeB = b.favoriteTime || new Date();
      return timeB.getTime() - timeA.getTime();
    });
  })

  // 处理收藏表格行点击
  const handleFavoriteRowClick = (row: any) => {
    if (row.isFolder) {
      enterFavoriteFolder(row);
    } else {
      openDocument(row);
    }
  }

  // 进入收藏文件夹
  const enterFavoriteFolder = (folder: any) => {
    if (!folder.isFolder) return;
    
    // 更新路径
    currentFavoritePath.value = [...currentFavoritePath.value, { id: folder.id, name: folder.name }];
  }

  // 返回上级收藏夹
  const navigateBackFavorites = () => {
    currentFavoritePath.value = currentFavoritePath.value.slice(0, -1);
  }

  // 返回收藏根目录
  const navigateToRootFavorites = () => {
    currentFavoritePath.value = [];
  }

  // 导航到指定的收藏路径
  const navigateToFavoritesPath = (index: number) => {
    currentFavoritePath.value = currentFavoritePath.value.slice(0, index + 1);
  }

  // 创建收藏子文件夹
  const createFavoriteSubFolder = (parentFolder: any) => {
    ElMessageBox.prompt('请输入文件夹名称', '新建收藏文件夹', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: ''
    }).then(({ value }) => {
      if (value.trim()) {
        // 创建新文件夹
        const newFolder = {
          id: Date.now(), // 使用时间戳作为临时ID
          title: value,   // 使用title字段保持一致性
          name: value,    // 同时保留name字段用于显示
          type: 'folder', // 添加type字段
          isFolder: true,
          favoriteTime: new Date(),
          parentId: parentFolder.id
        };
        
        // 添加到收藏列表
        favoriteDocuments.value.push(newFolder);
        
        ElMessage.success(`已创建收藏文件夹: ${value}`);
      }
    }).catch(() => {
      // 用户取消操作
    });
  }

  // 获取所有收藏文件夹
  const allFavoriteFolders = computed(() => {
    return favoriteDocuments.value.filter(item => item.isFolder);
  });

  // 创建根收藏文件夹
  const createRootFavoriteFolder = () => {
    ElMessageBox.prompt('请输入文件夹名称', '新建收藏文件夹', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: ''
    }).then(({ value }) => {
      if (value.trim()) {
        // 创建新文件夹
        const newFolder = {
          id: Date.now(), // 使用时间戳作为临时ID
          title: value,   // 使用title字段保持一致性
          name: value,    // 同时保留name字段用于显示
          type: 'folder', // 添加type字段
          isFolder: true,
          favoriteTime: new Date(),
          parentId: null  // 根目录
        };
        
        // 添加到收藏列表
        favoriteDocuments.value.push(newFolder);
        
        ElMessage.success(`已创建收藏文件夹: ${value}`);
      }
    }).catch(() => {
      // 用户取消操作
    });
  };

  // 添加到指定文件夹
  const addToSpecificFolder = (doc: any, folderId: number | null) => {
    // 检查是否已经在收藏中
    const exists = favoriteDocuments.value.some(item => 
      item.id === doc.id && item.parentId === folderId
    );
    
    if (exists) {
      ElMessage.warning('该文档已在此文件夹中收藏');
      return;
    }
    
    // 添加到收藏
    favoriteDocuments.value.push({
      id: doc.id,
      title: doc.name,
      type: doc.type,
      favoriteTime: new Date(),
      isFolder: doc.isFolder || false,
      parentId: folderId // 指定文件夹ID
    });
    
    const folderName = folderId ? 
      (favoriteDocuments.value.find(f => f.id === folderId)?.name || '指定文件夹') : 
      '根目录';
      
    ElMessage.success(`已添加到文件夹: ${folderName}`);
    
    // 实际应用中应调用API添加到收藏
  };

  </script>
  
<style lang="scss" scoped>
/* 整体布局 */
.personal-knowledge-base {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部导航栏 */
.top-navbar {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  z-index: 10;
}

.logo-section {
  width: 200px;
}

.logo-section h2 {
    margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #409EFF;
}

.navigation-tabs {
  flex: 1;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.dashboard-actions {
    display: flex;
    gap: 10px;
  }
  
/* 工作台网格 */
.dashboard-grid {
    margin-bottom: 20px;
  }
  


.section {
  margin-bottom: 20px;
}

.section-header {
    display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

/* 最近文档列表 */
.doc-list {
  display: flex;
  flex-direction: column;
    gap: 10px;
}

.doc-item {
  display: flex;
    align-items: center;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.doc-item:hover {
  background-color: #f0f7ff;
}

.doc-info {
  margin-left: 10px;
  display: flex;
  flex-direction: column;
}

.doc-title {
  font-size: 14px;
  margin-bottom: 3px;
}

.doc-meta {
  font-size: 12px;
  color: #909399;
}

/* 待办任务列表 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.task-item:hover {
  background-color: #f5f7fa;
}

.task-due {
  font-size: 12px;
  color: #909399;
}

.overdue {
  color: #F56C6C;
  font-weight: 500;
}

/* 收藏列表 */
.favorite-grid {
    display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.favorite-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.favorite-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.favorite-title {
  margin-top: 8px;
  font-size: 13px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

/* 数据统计 */
.statistics-panel {
    height: 100%;
  }
  
.stats-section {
  margin-bottom: 50px;
}

.stats-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.contribution-chart {
  height: 200px;
  margin-bottom: 15px;
}

.stats-summary {
    display: flex;
  justify-content: space-around;
  margin-top: 15px;
}

.stats-item {
  display: flex;
  flex-direction: column;
    align-items: center;
  }
  
  .stats-value {
  font-size: 24px;
  font-weight: 600;
    color: #409EFF;
}

.stats-label {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}

.learning-progress {
    display: flex;
  justify-content: space-around;
    align-items: center;
  margin-top: 15px;
  }
  
.progress-info {
    display: flex;
  flex-direction: column;
  gap: 15px;
  }
  
.progress-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
.progress-label {
  font-size: 14px;
  color: #606266;
  min-width: 50px;
}

.progress-value {
    font-size: 16px;
  font-weight: 600;
}



.notice-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.notice-title {
  margin-left: 8px;
  font-size: 14px;
  flex: 1;
}

.notice-time {
  font-size: 12px;
  color: #909399;
}

/* 文档管理页面 */
.documents-view {
  padding: 0 0 20px 0;
}

.documents-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.documents-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.document-actions {
    display: flex;
  gap: 10px;
}

/* 筛选区域 */
.filter-section {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.tag-filter {
  margin-top: 16px;
    display: flex;
    align-items: center;
  flex-wrap: wrap;
}

.tag-label {
  margin-right: 10px;
  font-size: 14px;
  color: #606266;
}

.tag-item {
  margin: 0 8px 8px 0;
    cursor: pointer;
}

/* 文件路径导航 */
.file-path-nav {
  background-color: #fff;
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.path-nav-container {
    display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  width: 100%;
}

.back-button {
  flex-shrink: 0;
}

.path-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

/* 表格样式 */
.file-name-cell {
  display: flex;
  align-items: center;
}

.file-icon {
  margin-right: 8px;
  color: #606266;
}

.folder-name {
  color: #409EFF;
  cursor: pointer;
  text-decoration: none;
}

.folder-name:hover {
  text-decoration: underline;
}

.table-actions {
  display: flex;
  justify-content: flex-start;
  position: relative;
  gap: 12px;
  margin-left: -10px;
}

.tag-in-table {
  margin: 0 4px 4px 0;
}



.file-grid-item {
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
    cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.file-grid-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.1);
}

.file-grid-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
    color: #409EFF;
  }
  
.file-grid-info {
  text-align: center;
}

.file-grid-name {
  font-size: 14px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-grid-meta {
  font-size: 12px;
  color: #909399;
}

.file-grid-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 10px;
}

.grid-tag {
  margin: 2px;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 上传文档对话框 */
.upload-area {
  width: 100%;
}

.el-upload__tip {
  line-height: 1.5;
  font-size: 12px;
  color: #909399;
}

/* 版本历史对话框 */
.version-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.version-info {
    flex: 1;
}

.version-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.version-meta {
  display: flex;
  gap: 15px;
  color: #606266;
  font-size: 13px;
  margin-bottom: 5px;
}

.version-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.version-actions {
    display: flex;
    flex-direction: column;
  gap: 8px;
}

/* 学习与成长页面 */
.learning-view {
  padding: 0 0 20px 0;
}

.learning-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.learning-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.learning-actions {
  display: flex;
  gap: 10px;
}

/* 学习与成长内容 */
.learning-tabs {
  height: 100%;
}

.plan-filter {
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.learning-plan-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.plan-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  height: 100%;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.1);
}

.completed-plan {
  border: 1px solid #67C23A;
}

.expired-plan {
  border: 1px solid #F56C6C;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.plan-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.plan-desc {
    font-size: 14px;
    color: #606266;
  margin-bottom: 15px;
  height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
.plan-progress {
  margin-top: 10px;
  }
  
.progress-text {
  margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
  font-size: 14px;
  color: #606266;
}

.plan-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #EBEEF5;
}

.plan-dates {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 13px;
    color: #909399;
  }
  
.plan-dates div {
  display: flex;
  align-items: center;
  gap: 5px;
}

.plan-actions {
  display: flex;
  gap: 5px;
}

/* 进度统计卡片 */
.progress-stats {
  margin-bottom: 20px;
}

.stats-card {
  text-align: center;
  padding: 20px;
  height: 100%;
}

.stats-value {
  font-size: 32px;
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 10px;
}

.stats-label {
  font-size: 14px;
  color: #606266;
}

/* 学习计划详情页 */
.plan-detail {
  padding: 0 20px;
}

.plan-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.plan-detail-status {
  display: flex;
  align-items: center;
}

.plan-period {
  margin-left: 10px;
  font-size: 14px;
  color: #606266;
}

.plan-detail-progress {
  width: 300px;
}

.plan-detail-desc {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.plan-detail-content {
  margin-bottom: 20px;
}

.plan-detail-content h4,
.plan-detail-notes h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.learning-item-name {
  display: flex;
  align-items: center;
}

.learning-item-name span {
    margin-left: 8px;
  }
  
.completed-item {
  text-decoration: line-through;
  color: #909399;
}

.plan-detail-notes {
  margin-bottom: 20px;
}

/* 知识图谱 */
.knowledge-map-container {
    display: flex;
  height: 600px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.knowledge-map-sidebar {
  width: 220px;
  padding: 20px;
  border-right: 1px solid #EBEEF5;
  overflow-y: auto;
}

.knowledge-map-content {
  flex: 1;
  overflow: hidden;
}

.knowledge-map-chart {
  width: 100%;
  height: 100%;
}

/* 协作与分享页面 */
.sharing-view {
  padding: 0 0 20px 0;
}

.sharing-header {
  display: flex;
  justify-content: space-between;
    align-items: center;
  margin-bottom: 20px;
}

.sharing-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.sharing-actions {
  display: flex;
  justify-content: space-around;
  gap: 5px;
}

.shares-filter {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.sharing-tabs .el-tabs__header {
  margin-bottom: 20px;
}

.sharing-list-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.share-name {
  display: flex;
  align-items: center;
}

.share-icon {
  margin-right: 8px;
  color: #606266;
}

.share-actions {
  display: flex;
  justify-content: space-around;
  gap: 5px;
}

.expired-text {
  color: #F56C6C;
}

.shared-with-me-empty,
.team-collaboration-empty {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 60px 0;
  margin-top: 20px;
}

/* 分享对话框样式 */
.el-select,
.el-date-picker {
    width: 100%;
  }
  
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 知识摘要对话框 */
.knowledge-summary-content {
  padding: 15px;
  background-color: #f0f9eb;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.6;
  white-space: pre-wrap;
  font-size: 14px;
  border-left: 4px solid #67c23a;
}

/* 文件路径导航 */
.file-path-nav {
  background-color: #fff;
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.path-nav-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-button {
  flex-shrink: 0;
}

.folder-grid-hint {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
  font-style: italic;
}

/* 编辑标签对话框 */
.edit-tags-content {
  padding: 0 10px;
}

.edit-tags-hint {
  margin-bottom: 15px;
  color: #606266;
}

.tag-select {
  width: 100%;
  margin-bottom: 20px;
}

.popular-tags-section {
  margin-top: 20px;
}

.popular-tags-section h4 {
  font-size: 14px;
  margin-bottom: 10px;
  color: #606266;
}

.popular-tags-list {
    display: flex;
    flex-wrap: wrap;
  gap: 8px;
}

/* 移动对话框样式 */
.move-dialog-content {
  padding: 0 10px;
}

.move-dialog-hint {
  margin-bottom: 15px;
  color: #606266;
}

.folder-tree-node {
  display: flex;
  align-items: center;
  gap: 5px;
}

.selected-path {
  margin-top: 15px;
  padding: 10px;
  background-color: #f0f9eb;
  border-radius: 4px;
  
  p {
    margin: 0;
    color: #606266;
  }
}

/* 管理收藏对话框 */
.manage-favorites-content {
  padding: 0 10px;
}

.favorite-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.favorites-actions {
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  margin-left: -10px;
}

.empty-favorites {
  padding: 30px 0;
}

/* 创建学习计划表单样式 */
.create-plan-btn {
  margin-top: 15px;
  width: 100%;
}

.date-separator {
  color: #606266;
  font-size: 14px;
}

.learning-items-section {
  margin-top: 20px;
  border-top: 1px solid #EBEEF5;
  padding-top: 20px;
}

.learning-items-header,
.resources-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.learning-items-header h4,
.resources-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.learning-items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.learning-item {
  border: 1px solid #EBEEF5;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.item-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.item-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
  min-height: 40px;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.time-estimate {
  font-size: 13px;
  color: #909399;
}



.learning-item-header h4 {
  margin: 0;
  font-size: 16px;
  color: #409eff;
}

/* 确保下拉菜单能够正常显示 */
:deep(.el-dropdown-menu) {
  z-index: 3000;
}

.upload-btn {
  background-color: #409EFF;
  border-color: #409EFF;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 4px;
}

.document-content {
  max-height: 600px;
  overflow-y: auto;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  line-height: 1.6;
}

.document-content pre {
  background-color: #f3f3f3;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

.document-content img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
}

/* 修复表格表头和单元格内容对齐问题 */
:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  text-align: left;
  padding: 12px 0;
}

:deep(.el-table td) {
  text-align: left;
  vertical-align: middle;
  padding: 12px 0;
}

:deep(.el-table .cell) {
  word-break: break-word;
  line-height: 23px;
  padding-left: 10px;
  padding-right: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-table--border th) {
  border-right: 1px solid #ebeef5;
}

:deep(.el-table--border td) {
  border-right: 1px solid #ebeef5;
}

/* 确保分享列表中表头和内容对齐 */
.sharing-list-container :deep(.el-table th .cell),
.sharing-list-container :deep(.el-table td .cell) {
  padding-left: 10px !important;
  padding-right: 10px !important;
  text-align: left !important;
  display: flex !important;
  align-items: center !important;
}

/* 表格每一列都左对齐 */
.sharing-list-container :deep(.el-table--enable-row-transition .el-table__body td.el-table__cell),
.sharing-list-container :deep(.el-table th.el-table__cell.is-leaf) {
  text-align: left !important;
}

/* 强制表格所有元素左对齐 */
:deep(.el-table) {
  width: 100% !important;
}

:deep(.el-table th),
:deep(.el-table td) {
  text-align: left !important;
}

:deep(.el-table th > .cell),
:deep(.el-table td > .cell) {
  text-align: left !important;
  padding-left: 0 !important;
}

:deep(.el-table .el-table__cell) {
  text-align: left !important;
}

/* 覆盖默认的表格样式 */
.el-table {
  --el-table-header-text-align: left !important;
  --el-table-cell-text-align: left !important;
}

/* 为所有表格列内容添加左对齐 */
:deep(.el-table-column--align-left) {
  text-align: left !important;
}

:deep(.el-table-column--align-left .cell) {
  text-align: left !important;
}

/* 全局强制表格左对齐 */
:deep(.el-table) .el-table__header-wrapper th {
  text-align: left !important;
  padding-left: 0 !important;
}

:deep(.el-table) .el-table__body-wrapper td {
  text-align: left !important;
  padding-left: 0 !important;
}

:deep(.el-table) .el-table__header-wrapper th .cell,
:deep(.el-table) .el-table__body-wrapper td .cell {
  text-align: left !important;
  padding-left: 10px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

:deep(.el-table .cell) {
  box-sizing: border-box !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: normal !important;
  word-break: break-all !important;
  line-height: 23px !important;
  padding-left: 10px !important;
  padding-right: 10px !important;
  text-align: left !important;
}

/* 美化表格操作按钮样式 */
.sharing-list-container .share-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3px;
}

.sharing-list-container .share-actions .el-button {
  padding: 4px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 确保所有操作图标垂直居中且大小一致 */
.sharing-list-container .el-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  height: 16px;
  width: 16px;
}

.sharing-list-container :deep(.el-table__header th) {
  height: 50px;
  vertical-align: middle;
  font-weight: 500;
  background-color: #f5f7fa;
}

.sharing-list-container :deep(.el-table__row td) {
  height: 60px;
  vertical-align: middle;
}

/* 确保表格内容垂直居中 */
.sharing-list-container :deep(.el-table__cell) {
  vertical-align: middle;
}

/* 确保表头文字居中 */
.sharing-list-container :deep(.el-table__header-wrapper th .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
}

/* 表格所有单元格内容垂直居中 */
.sharing-list-container :deep(.el-table__body-wrapper td .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
}

/* 左对齐内容名称列 */
.sharing-list-container :deep(.el-table__row td:first-child .cell) {
  justify-content: flex-start;
}

/* 强制所有表头居中 */
:deep(.el-table .el-table__header th) {
  text-align: center !important;
}

:deep(.el-table .el-table__header th .cell) {
  text-align: center !important;
  display: inline-flex !important;
  justify-content: center !important;
  width: 100% !important;
  padding: 0 10px !important;
}

/* 确保表头文字加粗且颜色统一 */
:deep(.el-table .el-table__header-wrapper th.el-table__cell .cell) {
  font-weight: bold !important;
  color: #606266 !important;
}

/* 内容名称列左对齐 */
.sharing-list-container :deep(.el-table__header-wrapper th:first-child .cell) {
  justify-content: flex-start !important;
  padding-left: 10px !important;
  text-align: left !important;
}

/* 确保内容名称列的单元格内容左对齐 */
.sharing-list-container :deep(.el-table__row td:first-child) {
  text-align: left !important;
}

/* 修正左侧第一列的样式，确保与表头对齐 */
.share-name {
  padding-left: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* 修改表格样式，美化整体外观 */
.sharing-list-container .el-table {
  margin-top: 10px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* 确保表头和单元格内容垂直居中 */
.sharing-list-container :deep(.el-table__cell) {
  padding: 8px 0;
}

/* 表头与内容左右内边距相同 */
.sharing-list-container :deep(.el-table__header-wrapper th .cell),
.sharing-list-container :deep(.el-table__body-wrapper td .cell) {
  padding: 0 10px;
}

/* 修改表格样式，去除边框 */
.sharing-list-container .el-table {
  margin-top: 10px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border: none !important;
}

/* 去除单元格边框 */
.sharing-list-container :deep(.el-table--border),
.sharing-list-container :deep(.el-table--border th),
.sharing-list-container :deep(.el-table--border td) {
  border: 0 !important;
}

/* 去除表头和内容之间的边框 */
.sharing-list-container :deep(.el-table__header-wrapper),
.sharing-list-container :deep(.el-table__body-wrapper) {
  border-bottom: none !important;
}

/* 设置单元格间距 */
.sharing-list-container :deep(.el-table__cell) {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0 !important;
}

/* 优化表格行间距和分隔线 */
.sharing-list-container :deep(.el-table__row) {
  height: 60px;
}

/* 表头与内容之间添加更明显的分隔 */
.sharing-list-container :deep(.el-table__header) {
  border-bottom: 2px solid #ebeef5 !important;
}

/* 确保最后一行没有底部边框 */
.sharing-list-container :deep(.el-table__row:last-child td) {
  border-bottom: none !important;
}

/* 修改表格行悬停效果 */
.sharing-list-container :deep(.el-table__row:hover > td) {
  background-color: #f5f7fa !important;
}

/* 调整表格列之间的间距 */
.sharing-list-container :deep(.el-table__header-wrapper th),
.sharing-list-container :deep(.el-table__body-wrapper td) {
  padding: 0 !important;
}

/* 调整表格列宽，减少空白空间 */
.sharing-list-container :deep(.el-table__header) {
  table-layout: fixed;
  width: 100% !important;
}

/* 确保内容紧凑 */
.sharing-list-container :deep(.el-table__body) {
  width: 100% !important;
  table-layout: fixed;
}

/* 移除可能的内边距，让列更紧凑 */
.sharing-list-container :deep(.el-table__cell .cell) {
  padding-left: 5px !important;
  padding-right: 5px !important;
}

/* 专门针对第一列和第二列的间距调整 */
.sharing-list-container :deep(.el-table__row td:first-child) {
  padding-right: 0 !important;
}

.sharing-list-container :deep(.el-table__row td:nth-child(2)) {
  padding-left: 0 !important;
}

/* 修改表格样式，去除边框 */
.documents-view .el-table {
  margin-top: 10px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border: none !important;
}

/* 去除单元格边框 */
.documents-view :deep(.el-table--border),
.documents-view :deep(.el-table--border th),
.documents-view :deep(.el-table--border td) {
  border: 0 !important;
}

/* 去除表头和内容之间的边框 */
.documents-view :deep(.el-table__header-wrapper),
.documents-view :deep(.el-table__body-wrapper) {
  border-bottom: none !important;
}

/* 设置单元格间距 */
.documents-view :deep(.el-table__cell) {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0 !important;
}

/* 优化表格行间距和分隔线 */
.documents-view :deep(.el-table__row) {
  height: 60px;
}

/* 表头与内容之间添加更明显的分隔 */
.documents-view :deep(.el-table__header) {
  border-bottom: 2px solid #ebeef5 !important;
}

/* 确保最后一行没有底部边框 */
.documents-view :deep(.el-table__row:last-child td) {
  border-bottom: none !important;
}

/* 修改表格行悬停效果 */
.documents-view :deep(.el-table__row:hover > td) {
  background-color: #f5f7fa !important;
}

/* 确保表格内容垂直居中 */
.documents-view :deep(.el-table__cell) {
  vertical-align: middle;
}

/* 确保表头文字居中和内容对齐 */
.documents-view :deep(.el-table__header-wrapper th .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
}

/* 表格所有单元格内容垂直居中 */
.documents-view :deep(.el-table__body-wrapper td .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
}

/* 左对齐内容名称列 */
.documents-view :deep(.el-table__row td:first-child .cell) {
  justify-content: flex-start;
}

/* 内容名称列左对齐 */
.documents-view :deep(.el-table__header-wrapper th:first-child .cell) {
  justify-content: flex-start !important;
  padding-left: 10px !important;
  text-align: left !important;
}

/* 确保内容名称列的单元格内容左对齐 */
.documents-view :deep(.el-table__row td:first-child) {
  text-align: left !important;
}

/* 美化表格操作按钮样式 */
.documents-view .table-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3px;
}

.documents-view .table-actions .el-button {
  padding: 4px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 确保所有操作图标垂直居中且大小一致 */
.documents-view .el-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  height: 16px;
  width: 16px;
}

/* 历史版本对话框样式 */
.history-version-container {
  padding: 0;
}

.history-version-container :deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
}

/* 表格单元格内容垂直居中 */
.history-version-container :deep(.el-table__cell) {
  vertical-align: middle;
}

/* 确保表头与内容左右对齐 */
.history-version-container :deep(.el-table__header-wrapper th .cell),
.history-version-container :deep(.el-table__body-wrapper td .cell) {
  padding: 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 去除表格边框 */
.history-version-container :deep(.el-table--border),
.history-version-container :deep(.el-table--border th.is-leaf),
.history-version-container :deep(.el-table--border td) {
  border-color: #ebeef5;
}

/* 表头底部边框加深 */
.history-version-container :deep(.el-table__header) {
  border-bottom: 2px solid #dcdfe6;
}

/* 确保表格行高度一致 */
.history-version-container :deep(.el-table__row) {
  height: 52px;
}
  </style>



