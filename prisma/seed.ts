import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const name = process.env.SUPERADMIN_NAME || "Super Admin";
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  console.log(`🔍 Checking superadmin: ${email}...`);

  const existingSuperadmins = await prisma.user.findMany({
    where: { role: "SUPERADMIN" },
  });

  const seedUserIsSuperadmin = existingSuperadmins.find((u) => u.email === email);
  if (seedUserIsSuperadmin) {
    console.log(`✅ Superadmin "${email}" already exists with correct role.`);
    const others = existingSuperadmins.filter((u) => u.id !== seedUserIsSuperadmin.id);
    for (const other of others) {
      await prisma.user.update({ where: { id: other.id }, data: { role: "ADMIN" } });
      console.log(`   ⚠ Downgraded "${other.email}" from SUPERADMIN → ADMIN`);
    }
    await prisma.$disconnect();
    return;
  }

  for (const sa of existingSuperadmins) {
    await prisma.user.update({ where: { id: sa.id }, data: { role: "ADMIN" } });
    console.log(`   ⚠ Downgraded "${sa.email}" from SUPERADMIN → ADMIN`);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { role: "SUPERADMIN", name },
    });
    console.log(`✅ Upgraded existing user "${email}" to SUPERADMIN`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "SUPERADMIN" },
    });
    console.log(`✅ Created superadmin "${email}"`);
  }

  console.log("🎉 Seed complete. Only one SUPERADMIN exists.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Seed failed:", e.message);
  process.exit(1);
});
