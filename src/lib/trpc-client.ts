import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { type AppRouter } from '@/server/routers'

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
})
