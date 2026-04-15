import { initTRPC, TRPCError } from '@trpc/server'
import { Request } from 'express'
import { verifyToken, JWTPayload } from './lib/auth'

interface Context {
  user: JWTPayload | null
}

export function createContext({ req }: { req: Request }): Context {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return { user: null }
  try {
    const token = authHeader.split(' ')[1]!
    const user = verifyToken(token)
    return { user }
  } catch {
    return { user: null }
  }
}

const trpc = initTRPC.context<Context>().create()

export const router = trpc.router
export const publicProcedure = trpc.procedure

const isAuthenticated = trpc.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { user: ctx.user } })
})
export const protectedProcedure = trpc.procedure.use(isAuthenticated)

const isAdmin = trpc.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== 'ADMIN') throw new TRPCError({ code: 'FORBIDDEN' })
  return next({ ctx: { user: ctx.user } })
})
export const adminProcedure = trpc.procedure.use(isAdmin)
