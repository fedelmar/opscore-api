import 'dotenv/config'
import { prisma } from '../src/prisma/client'
import { hashPassword } from '../src/lib/auth'

async function main() {
  const password = await hashPassword('admin1234')
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password, name: 'Administrador', role: 'ADMIN' },
  })
  console.log('Seed completado — usuario admin creado')
}

main().catch(console.error).finally(() => prisma.$disconnect())
