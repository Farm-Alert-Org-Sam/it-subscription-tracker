'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSession() {
  const supabase = createClient()
  const [session, setSession] = useState<{ user: { id: string; email?: string; name?: string } } | null>(null)
  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) setSession({ user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name } })
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession?.user ? { user: { id: nextSession.user.id, email: nextSession.user.email, name: nextSession.user.user_metadata?.name } } : null)
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [supabase])
  return { data: session }
}

export async function signOut({ fetchOptions }: { fetchOptions?: { onSuccess?: () => void } } = {}) {
  const { error } = await createClient().auth.signOut()
  if (!error) fetchOptions?.onSuccess?.()
}
