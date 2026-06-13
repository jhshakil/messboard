import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Keep pool alive across hot reloads in dev
const pool = globalForPrisma.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 1,
  idleTimeoutMillis: 300000,   // 5 min — matches Neon's server-side idle timeout
  connectionTimeoutMillis: 5000, // 5 sec — enough for Neon cold start wake-up
});

if (!globalForPrisma.pool) globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
