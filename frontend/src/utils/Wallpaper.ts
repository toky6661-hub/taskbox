import { getOnlineWallpaper } from '../api/Wallpaper.ts'

const defaultWallpaper = '/src/assets/wallpapers/default.jpg'

export async function loadWallpaper() {
  // 1. 用户自定义
  const custom = localStorage.getItem('custom-wallpaper')
  if (custom) return custom

  // 2. 在线壁纸
  const online = await getOnlineWallpaper()
  if (online) {
    localStorage.setItem('today-wallpaper', online)
    return online
  }

  // 3. 本地缓存
  const cache = localStorage.getItem('today-wallpaper')
  if (cache) return cache

  // 4. 默认
  return defaultWallpaper
}

export function setCustomWallpaper(url: string) {
  localStorage.setItem('custom-wallpaper', url)
}

export function removeCustomWallpaper() {
  localStorage.removeItem('custom-wallpaper')
}