import request from '@/utils/request81.ts'

// 团队创建接口参数类型
interface CreateTeamParams {
  teamName: string;
  description: string;
  status: number;
  ownerId?: number;
}

// 获取团队列表
export function getTeamList() {
  return request({
    url: '/user/teams/getTeamList',
    method: 'get'
  })
}

// 创建团队
export function createTeam(data: CreateTeamParams) {
  // 移除可能的ownerId,因为后端API实际不需要这个参数
  const { teamName, description, status } = data;
  const submitData = { teamName, description, status };
  
  return request({
    url: '/user/teams/createTeam',
    method: 'post',
    data: submitData,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 更新团队信息
export function updateTeam(data: any) {
  return request({
    url: '/user/teams/updateTeam',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取团队成员列表
export function getTeamMembers(teamId: number) {
  return request({
    url: '/user/teams/listMember',
    method: 'get',
    params: { teamId }
  })
}

// 添加团队成员
export function addTeamMember(data: any) {
  return request({
    url: '/user/teams/addMember',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 删除团队成员
export function deleteTeamMember(data: any) {
  return request({
    url: '/user/teams/deleteMember',
    method: 'post',
    data
  })
}

// 更新团队成员角色
export function updateTeamRole(data: {
  roleId: number,
  teamId: number,
  userId: number
}) {
  return request({
    url: '/user/teams/updateTeamRole',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取团队申请列表
export function getTeamApplyList(teamId: number) {
  return request({
    url: '/user/teams/applyList',
    method: 'post',
    data: { teamId }
  })
}

// 批准加入团队申请
export function passJoinTeam(data: any) {
  return request({
    url: '/user/teams/passJoinTeam',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 拒绝加入团队申请
export function rejectJoinTeam(data: any) {
  return request({
    url: '/user/teams/rejectJoinTeam',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 申请加入团队参数类型
interface ApplyForJoinTeamParams {
  teamId: number;
  userId: number;
  applyMessage: string;
}

// 申请加入团队
export function applyForJoinTeam(data: ApplyForJoinTeamParams) {
  return request({
    url: '/user/teams/applyForJoinTeam',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 根据团队id获取团队信息
export function getTeamInfo(teamId: number) {
  return request({
    url: '/user/teams/getTeamInfo',
    method: 'post',
    data: { teamId }
  })
}

// 退出团队
export function exitTeam() {
  return request({
    url: '/user/teams/exitTeam',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 删除团队
export function deleteTeam(teamId: number) {
  return request({
    url: '/user/teams/deleteTeam',
    method: 'post',
    data: { teamId },
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取团队知识统计 - 知识数量和分享到社区的知识数量
export function getTeamKnowledgeStatistics() {
  return request({
    url: '/user/statics/ks/teamStatics',
    method: 'get'
  })
}

// 获取团队成员统计 - 团队成员个数和本月新增成员数量
export function getTeamMemberStatistics() {
  return request({
    url: '/user/teams/teamMemberStatics',
    method: 'get'
  })
}

// 获取团队知识库最近更新知识
export function getTeamRecentUpdatedKnowledge(space: number, startIndex: number = 1, num: number = 10) {
  return request({
    url: `/user/ks/recent/update/${space}`,
    method: 'get',
    params: { startIndex, num }
  })
}

// 获取团队知识库最近创建知识
export function getTeamRecentCreatedKnowledge(space: number, startIndex: number = 1, num: number = 10) {
  return request({
    url: `/user/ks/recent/create/${space}`,
    method: 'get',
    params: { startIndex, num }
  })
}

// 获取团队知识库热门文档（根据文档修改次数）
export function getTeamHotKnowledge(space: number, startIndex: number = 1, num: number = 10) {
  return request({
    url: `/user/ks/recent/hot/${space}`,
    method: 'get',
    params: { startIndex, num }
  })
}

// 获取团队知识库月访问文档数量
export function getTeamMonthlyViewStatistics(viewType: number) {
  return request({
    url: `/user/statics/view/dataStatics/${viewType}`,
    method: 'get'
  })
}

// 获取团队知识库文档编辑次数
export function getTeamKnowledgeEditStatistics() {
  return request({
    url: '/user/statics/ks/teamEditStatics',
    method: 'get'
  })
}

// 获取团队成员角色及对应角色数量
export function getTeamMemberRoleStatistics() {
  return request({
    url: '/user/teams/teamMemberRoleStatics',
    method: 'get'
  })
}

// 获取团队知识库所有知识集以及对应的知识数量
export function getTeamKnowledgeSetsStatistics(space: number) {
  return request({
    url: `/user/kbs/allSetStatics/${space}`,
    method: 'get'
  })
}

// 获取团队知识库按月份知识创建数量
export function getTeamKnowledgeCreateByMonth(space: number) {
  return request({
    url: `/user/ks/recentStatics/create/${space}`,
    method: 'get'
  })
}

// 获取团队知识库按月份知识编辑次数
export function getTeamKnowledgeEditByMonth(space: number) {
  return request({
    url: `/user/ks/recentStatics/edit/${space}`,
    method: 'get'
  })
}

// 获取团队知识库按月份知识浏览次数
export function getTeamKnowledgeViewByMonth(space: number) {
  return request({
    url: `/user/ks/recentStatics/view/${space}`,
    method: 'get'
  })
}
