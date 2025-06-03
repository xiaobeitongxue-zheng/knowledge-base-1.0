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
    data
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
    data
  })
}

// 拒绝加入团队申请
export function rejectJoinTeam(data: any) {
  return request({
    url: '/user/teams/rejectJoinTeam',
    method: 'post',
    data
  })
}

// 申请加入团队
export function applyForJoinTeam(data: any) {
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
    data: { teamId }
  })
}
