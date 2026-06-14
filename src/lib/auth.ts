import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user) return null;

        // Check regular password first, then temp password
        let valid = false;
        if (user.password) {
          valid = await bcrypt.compare(credentials.password as string, user.password);
        }
        if (!valid && user.tempPassword) {
          valid = await bcrypt.compare(credentials.password as string, user.tempPassword);
        }
        if (!valid) return null;

        if (!user.isActive) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          forcePasswordChange: user.forcePasswordChange,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.picture = user.image;
        token.forcePasswordChange = (user as any).forcePasswordChange ?? false;
      }

      // On client-side session update, apply new data directly — no DB needed
      if (trigger === "update" && session) {
        const s = session as any;
        if (s?.user?.name) token.name = s.user.name;
        if (s?.user?.image !== undefined) token.picture = s.user.image;
        if (s?.forcePasswordChange !== undefined) token.forcePasswordChange = s.forcePasswordChange;
      }

      // Periodically refresh from DB if name is missing
      if (token.id && !token.name) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { name: true, image: true, role: true, forcePasswordChange: true, isActive: true },
          });
          if (dbUser) {
            token.name = dbUser.name;
            token.picture = dbUser.image;
            token.role = dbUser.role;
            token.forcePasswordChange = dbUser.forcePasswordChange;
            if (!dbUser.isActive) return {} as typeof token;
          }
        } catch (e) {
          console.error("JWT refresh failed:", e);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.role = token.role as string;
        (session as any).forcePasswordChange = token.forcePasswordChange as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
