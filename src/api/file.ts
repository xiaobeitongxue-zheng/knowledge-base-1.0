import request from '@/utils/request81.ts'

export function fileUpload(data: FormData) {
    // 上传文件接口
    // 需要的参数:
    // - current_version: 当前版本号(integer)
    // - file: 文件数据
    // - knowledge_id: 知识ID(integer)
    // - new_version: 新版本号(integer)
    // - set_id: 知识集ID(integer)
    return request({
        url: '/api/file/uploadFile',
        method: 'post',
        data,
        headers: {
            noToken: true,
            'Content-Type': 'multipart/form-data'
        }
    })
}

export function fileDownload(filePath: string) {
    return request({
        url: '/api/file/downloadFile',
        method: 'post',
        params: { filePath },
        headers: {
            noToken: true // 文件操作不需要token
        }
    })
}

/**
 * TT123接口
 * GET方法获取文件信息
 * 请求类型：application/x-www-form-urlencoded
 * 响应类型：所有类型
 */
export function getFileInfo() {
    return request({
        url: '/api/file/123',
        method: 'get',
        headers: {
            noToken: true
        }
    })
}

export function imageUpload(image: File) {
    // 上传图片到OSS接口
    // 需要的参数:
    // - image: 图片文件数据
    return request({
        url: '/api/file/imageUpload',
        method: 'post',
        data: { image },
        headers: {
            noToken: true, // 文件操作不需要token
            'Content-Type': 'multipart/form-data'
        }
    })
}