import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import type { UserRole } from "@prisma/client";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordCorrect = await bcryptjs.compare(
          credentials.password as string,
          user.password
        );

        if (isPasswordCorrect) {
          return user;
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        // @ts-expect-error
        session.user.phoneNumber = token.phoneNumber as string; // ADD: Pass phoneNumber to session
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
      });

      if (!dbUser) return token;

      token.id = dbUser.id;
      token.role = dbUser.role;
      token.phoneNumber = dbUser.phoneNumber; // ADD: Add phoneNumber to the JWT token

      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
});
