import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { prisma } from '../prisma/client'
import { signToken, comparePassword } from '../lib/auth'

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({ where: { username: input.username } })

      if (!user || !user.active) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuario o contraseña incorrectos' })
      }

      const valid = await comparePassword(input.password, user.password)
      if (!valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuario o contraseña incorrectos' })
      }

      const token = signToken({ userId: user.id, username: user.username, role: user.role })

      return {
        token,
        user: { id: user.id, username: user.username, name: user.name, role: user.role },
      }
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.userId },
      select: { id: true, username: true, name: true, role: true, email: true },
    })
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' })
    return user
  }),
})
