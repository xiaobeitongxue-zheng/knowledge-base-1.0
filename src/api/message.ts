import request from '@/utils/request81.ts'

/**
 * 获取用户所有通知
 * @param params 请求参数
 * @returns 通知列表
 */
export function getUserNotifications(params: { startIndex: number, num?: number }) {
  return request({
    url: '/user/notification',
    method: 'post',
    params
  })
}

/**
 * 标记通知为已读
 * @param messageId 通知ID
 * @returns 操作结果
 */
export function markNotificationAsRead(messageId: number) {
  return request({
    url: '/user/notification/read',
    method: 'post',
    params: {
      messageId
    }
  })
}

/**
 * 分页返回全部未读消息
 * @param params 分页参数
 * @returns 未读消息列表
 */
export function getUnreadNotifications(params: { startIndex: number, num?: number }) {
  return request({
    url: '/user/notification/unReadList',
    method: 'get',
    params
  })
}

/**
 * 标记全部未读消息为已读
 * @returns 操作结果
 */
export function markAllNotificationsAsRead() {
  return request({
    url: '/user/notification/allRead',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 删除指定消息
 * @param messageId 消息ID
 * @returns 操作结果
 */
export function deleteNotification(messageId: number) {
  return request({
    url: `/user/notification/delete/${messageId}`,
    method: 'post'
  })
}

/**
 * 删除所有已读消息
 * @returns 操作结果
 */
export function deleteAllReadNotifications() {
  return request({
    url: '/user/notification/deleteAllRead',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

//返回未读消息个数
export function getunReadCount() {
  return request({
    url: '/user/notification/unReadCount',
    method: 'post'
  })
}



