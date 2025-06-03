import request from '@/utils/request81.ts'
import axios from 'axios'

// 设置axios默认请求头
axios.defaults.headers.post['Content-Type'] = 'application/json'

// 用户登录接口（无需Token验证）
export function login(data: { username: string | number; password: string | number }) {
  console.log('登录API调用，数据:', JSON.stringify(data))
  
  // 登录前清除之前的头像缓存
  localStorage.removeItem('avatar');
  
  return request({
    url: '/user/users/login',
    method: 'post',
    data: data,
    headers: {
      // 登录接口不需要Token
      noToken: true,
      'Content-Type': 'application/json'
    }
  })
}

// 用户注册接口（无需Token验证）
export function register(data: any) {
  return request({
    url: '/user/users/register',
    method: 'post',
    data: data,
    headers: {
      // 注册接口不需要Token
      noToken: true,
      'Content-Type': 'application/json'
    }
  })
}

// 忘记密码接口（无需Token验证）
// export function forgetPassword(data: any) {
//   return request({
//     url: '/user/users/forget-password',
//     method: 'post',
//     data,
//     headers: {
//       // 忘记密码接口不需要Token
//       noToken: true
//     }
//   })
// }

// 获取用户信息接口（需要Token验证）
export function getUserInfo() {
  return request({
    url: '/user/users/settings',
    method: 'get'
  })
}

export function updateUserInfo(data: any) {
  return request({
    url: '/user/users/settings',
    method: 'put',
    data: data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 登出接口（需要Token验证）
// export function logout() {
//   return request({
//     url: '/user/users/logout',
//     method: 'post'
//   })
// }

// 更新用户团队ID
export function updateUserTeamId(teamId: number) {
  return request({
    url: '/user/users/updateTeamId',
    method: 'post',
    data: { teamId },
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

