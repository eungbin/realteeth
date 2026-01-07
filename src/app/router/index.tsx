import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/widgets/layout'
import { HomePage } from '@/pages/home'
import { PlacePage } from '@/pages/place'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/place/:placeId', element: <PlacePage /> },
    ],
  },
])


