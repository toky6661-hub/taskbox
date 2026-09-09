// backend/src/routes/hot.routes.ts
const express = require('express')
const axios = require('axios')

const router = express.Router()

// 热点数据接口（代理）
router.get('/list', async (_req: any, res: any) => {
  try {
    // 使用更稳定的 API（天行数据免费版，需要申请 key，这里用另一个免费接口）
    // 或者使用聚合数据等，为了稳定，我们使用内置模拟数据 + 可选的在线源
    // 这里尝试请求多个源，哪个成功用哪个
    const sources = [
      {
        url: 'https://api.ichunzui.com/hot/hotlist',
        parser: (data: any) => {
          if (data.code === 200 && Array.isArray(data.data)) {
            return data.data.slice(0, 10).map((item: any) => ({
              title: item.title || item.name || '',
              hot: item.hot || item.num || ''
            }))
          }
          return null
        }
      },
      // 备用：知乎热榜（使用第三方代理）
      {
        url: 'https://api.zhihu.com/topstory/hot-list?limit=10',
        parser: (data: any) => {
          if (data && data.data && Array.isArray(data.data)) {
            return data.data.map((item: any) => ({
              title: item.target?.title || item.title || '',
              hot: item.detail_text || ''
            }))
          }
          return null
        }
      }
    ]

    let result = null
    for (const source of sources) {
      try {
        const response = await axios.get(source.url, { timeout: 5000 })
        const parsed = source.parser(response.data)
        if (parsed && parsed.length > 0) {
          result = parsed
          break
        }
      } catch (e) {
        console.warn(`热点源 ${source.url} 失败:`, e instanceof Error ? e.message : e)
      }
    }

    // 如果所有源都失败，返回模拟数据
    if (!result) {
      result = [
        { title: '神舟十七号成功着陆', hot: '892万' },
        { title: '五一假期火车票开售', hot: '763万' },
        { title: '华为Pura 70系列发布', hot: '654万' },
        { title: '特斯拉宣布全球裁员10%', hot: '521万' },
        { title: '巴黎奥运会倒计时100天', hot: '487万' },
        { title: 'AI大模型掀起价格战', hot: '396万' },
        { title: '我国超长期特别国债即将发行', hot: '312万' },
        { title: '广州暴雨引发内涝', hot: '278万' },
      ]
    }

    res.json({
      code: 200,
      data: result
    })
  } catch (error) {
    console.error('热点代理错误:', error)
    res.status(500).json({ code: 500, message: '服务器内部错误' })
  }
})

module.exports = router