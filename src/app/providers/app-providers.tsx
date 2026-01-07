import type { ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import { queryClient } from './query-client'
import { router } from '../router'

type AppProvidersProps = {
  children?: ReactNode
}

export function AppProviders(_props: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}


