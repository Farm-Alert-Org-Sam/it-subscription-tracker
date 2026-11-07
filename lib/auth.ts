import { createClient } from '@/lib/supabase/server'

export const auth = {
  api: {
    async getSession() {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return null
      return { user: { id: user.id, email: user.email, name: user.user_metadata?.name ?? user.email } }
    },
  },
}
