// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // เอาไว้ดู log เวลา query ข้อมูล (ลบออกได้ถ้าไม่อยากดู)
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
