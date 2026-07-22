// ============================================
// CardScan Pro — NextAuth.js v5 Configuration
// ============================================

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signInSchema } from "@/lib/validations";
import { getOrCreateSubscription } from "@/services/subscription.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const validated = signInSchema.safeParse(credentials);
          if (!validated.success) return null;

          const { email, password } = validated.data;

          const user = await db.user.findUnique({ where: { email } });
          if (!user || !user.password) return null;

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role as "USER" | "ADMIN",
          };
        } catch (error) {
          console.error(
            "Authorize error:",
            error instanceof Error ? error.message : error
          );
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (("role" in user ? (user.role as string) : "USER") ?? "USER") as "USER" | "ADMIN";
      }
      if (token.email) {
        const adminEmails = (process.env.ADMIN_EMAIL ?? "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        if (adminEmails.includes(token.email.toLowerCase())) {
          token.role = "ADMIN";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }
      return session;
    },
    async signIn({ user, account }) {
      try {
        if (account?.provider !== "credentials" && user?.id) {
          await getOrCreateSubscription(user.id);
        }

        if (user?.email && user?.id) {
          const adminEmails = (process.env.ADMIN_EMAIL ?? "")
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
          if (
            adminEmails.includes(user.email.toLowerCase())
          ) {
            await db.user.updateMany({
              where: { id: user.id, role: { not: "ADMIN" } },
              data: { role: "ADMIN" },
            });
          }
        }
      } catch (error) {
        console.error(
          "SignIn callback error:",
          error instanceof Error ? error.message : error
        );
      }
      return true;
    },
  },
});
