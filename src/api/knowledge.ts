import request from '@/utils/request81'

// 知识集相关API

// 创建知识集
export function createKnowledgeSet(name: string, space: number) {
  return request({
    url: '/user/kbs',
    method: 'post',
    data: {
      name,
      space
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 更新知识集
export function updateKnowledgeSet(data: {
  id: number,
  name: string,
  ownerId?: number,
  ownerType?: number,
  space?: number
}) {
  return request({
    url: '/user/kbs',
    method: 'put',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取知识集列表
export function getKnowledgeSets(spaceId: number) {
  return request({
    url: '/user/kbs',
    method: 'get',
    params: {
      space: spaceId
    }
  })
}

// 删除知识集
export function deleteKnowledgeSet(id: number, spaceId?: number) {
  return request({
    url: '/user/kbs',
    method: 'delete',
    params: {
      id,
      space: spaceId
    }
  })
}

// 知识相关API

// 搜索知识
export function searchKnowledge(keyword: string, space: number) {
  return request({
    url: '/api/knowledge/search',
    method: 'get',
    params: {
      keyword,
      space
    }
  })
}

// 新增知识
export function createKnowledge(setId: number, spaceId: number, data: FormData) {
  return request({
    url: `/user/ks/${spaceId}/${setId}`,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 修改知识预览
export function updateKnowledgePreview(spaceId: number, setId: number,knowledgeId: number, data: {
  name?: string,
  status?: number,
  summary?: string,
  
}) {
  return request({
    url: `/user/ks/preview/${spaceId}/${setId}/${knowledgeId}`,
    method: 'put',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取所有知识
export function getAllKnowledge(spaceId: number,setId: number) {
  return request({
    url: `/user/ks/${spaceId}/${setId}`,
    method: 'get'
  })
}

// 获取指定知识
export function getKnowledge(spaceId: number,setId: number,knowledgeId: number) {
  return request({
    url: `/user/ks/preview/${spaceId}/${setId}/${knowledgeId}`,
    method: 'get'
  })
}

// 修改知识
export function updateKnowledge(setId: number, spaceId: number, knowledgeId: number, data: FormData) {
  // 确保FormData中包含必须的file参数
  if (!data.has('file')) {
    console.error('Error: FormData必须包含file参数')
    throw new Error('FormData必须包含file参数')
  }
  
  return request({
    url: `/user/ks/${setId}/${spaceId}/${knowledgeId}`,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除知识
export function deleteKnowledge( spaceId: number, setId: number, knowledgeId: number) {
  return request({
    url: `/user/ks/${spaceId}/${setId}/${knowledgeId}`,
    method: 'delete'
  })
}

//  发布知识到社区
export function publishKnowledge(spaceId: number, setId: number,  knowledgeId: number) {
  return request({
    url: `/user/ks/public/${spaceId}/${setId}/${knowledgeId}`,
    method: 'post'
  })
}

//  取消发布知识到社区
export function cancelPublishKnowledge(spaceId: number, setId: number,  knowledgeId: number) {
  return request({
    url: `/user/ks/private/${spaceId}/${setId}/${knowledgeId}`,
    method: 'post'
  })
}

// 个人知识分享到团队接口
export function shareKnowledgeToTeam(setId: number, kId: number) {
  return request({
    url: `/user/ks/share/toTeam/${setId}/${kId}`,
    method: 'post'
  })
}

// 根据空间id获取所有分享到社区的知识
export function getAllSharedToCommunity(space: number, num?: number, startIndex?: number) {
  return request({
    url: `/user/ks/share/${space}`,
    method: 'get',
    params: {
      ...(num !== undefined ? { num } : {}),
      ...(startIndex !== undefined ? { startIndex } : {})
    }
  })
}

// 查询知识的所有历史版本
export function getKnowledgeVersions(kId: number) {
  return request({
    url: `/user/version/${kId}`,
    method: 'get'
  })
}

// 回滚知识到历史版本
export function rollbackKnowledgeVersion(kId: number, versionId: number) {
  return request({
    url: `/user/version/switchVersion/${kId}/${versionId}`,
    method: 'post'
  })
}

// 按周或月返回知识创建数量
export function getKnowledgeCreateCount(space: number, dateType: number) {
  return request({
    url: `/user/statics/ksNumber/${space}/${dateType}`,
    method: 'get'
  })
}

// 返回用户上传、编辑、分享知识数量
export function getUserKnowledgeOperationCount(space: number) {
  return request({
    url: `/user/statics/ks/operation/${space}`,
    method: 'get'
  })
}

// 新建用户代办
export function createUserAgency(data: { agencyName?: string, deadline?: string }) {
  return request({
    url: '/user/agency',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 分页查询用户所有代办
export function getUserAgencyList(num?: number, startIndex?: number) {
  let url = '/user/agency';
  const params: string[] = [];
  if (startIndex !== undefined) params.push(`startIndex=${startIndex}`);
  if (num !== undefined) params.push(`num=${num}`);
  if (params.length) url += '?' + params.join('&');
  return request({
    url,
    method: 'get'
  });
}

// 批量完成代办
export function completeUserAgencies(agencyIds: number[]) {
  return request({
    url: '/user/agency/complete',
    method: 'post',
    data: { agencyIds },
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 根据空间id查询所有知识
export function getAllKnowledgeBySpace(space: number) {
  return request({
    url: `/user/ks/${space}/getAllKnowldge`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 收藏相关接口

// 获取用户所有收藏夹
export function getUserFavoriteFolders() {
  return request({
    url: '/index/favourite/myFolders',
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 新建收藏夹
export function createFavoriteFolder(data: { name: string, description?: string }) {
  return request({
    url: '/index/favourite/addFolder',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 修改收藏夹
export function updateFavoriteFolder(data: { folderId: number, name: string, description?: string }) {
  return request({
    url: '/index/favourite/modifyFolder',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 删除收藏夹
export function deleteFavoriteFolder(folderId: number) {
  return request({
    url: `/index/favourite/deleteFolder/${folderId}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 获取收藏夹下的所有收藏项
export function getFavoriteFolderItems(folderId: number) {
  return request({
    url: `/index/favourite/${folderId}/items`,
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 添加收藏
export function addFavoriteItem(communityKnowledgeId: number, folderId: number) {
  return request({
    url: '/index/favourite/addItem',
    method: 'post',
    params: {
      communityKnowledgeId,
      folderId
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

// 取消收藏社区知识
export function cancelFavoriteItem(communityKnowledgeId: number) {
  return request({
    url: `/index/favourite/concealFavourite/${communityKnowledgeId}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

