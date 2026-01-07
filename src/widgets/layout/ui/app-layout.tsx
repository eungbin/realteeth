import { Outlet } from 'react-router-dom'

import { Container } from '@/shared/ui/container'

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <Container className="flex h-14 items-center justify-between">
          <div className="font-semibold tracking-tight">Weather</div>
          <div className="text-sm text-slate-500">Korea</div>
        </Container>
      </header>

      <main>
        <Container className="py-6">
          <Outlet />
        </Container>
      </main>
    </div>
  )
}


