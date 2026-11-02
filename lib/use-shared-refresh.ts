import { useEffect, useState } from 'react'

export function useSharedRefresh(intervalMs = 10000) {
  const [refreshKey, setRefreshKey] = useState(0)
  useEffect(() => { const refresh = () => setRefreshKey((value) => value + 1); const timer = window.setInterval(refresh, intervalMs); window.addEventListener('focus', refresh); return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh) } }, [intervalMs])
  return refreshKey
}
