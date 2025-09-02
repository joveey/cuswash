import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./prisma"
// FIX: Gunakan 'import type' untuk tipe data dari Prisma
import type { User, UserRole } from "@prisma/client"
import { Adapter } from "next-auth/adapters"

export const { handlers, auth, signIn, signOut } = NextAuth({
  // FIX: Cast prisma ke Adapter untuk kompatibilitas
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    // Tambahkan provider Anda di sini, contoh: Google, GitHub, Credentials
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session
    },
    async jwt({ token }) {
      if (!token.sub) return token
      
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
      });

      if (!dbUser) return token;
      
      token.id = dbUser.id;
      token.role = dbUser.role;

      return token
    },
  },
  pages: {
      signIn: '/login',
  }
})
