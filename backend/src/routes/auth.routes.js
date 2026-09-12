// backend/src/routes/hot.routes.js
const express = require('express')
const axios = require('axios')

const router = express.Router()

router.get('/list', async (_req, res) => {
  try {
    const sources = [
      {
        url: 'https://api.ichunzui.com/hot/hotlist',
        parser: (data) => {
          if (data.code === 200 && Array.isArray(data.data)) {
            return data.data.slice(0, 10).map((item) => ({
              title: item.title || item.name || '',
              hot: item.hot || item.num || ''
            }))
          }
          return null
        }
      },
      {
        url: 'https://api.zhihu.com/topstory/hot-list?limit=10',
        parser: (data) => {
          if (data && data.data && Array.isArray(data.data)) {
            return data.data.map((item) => ({
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