import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // 1. USE JWT STRATEGY
  session: {
    strategy: "jwt",
    
    // 👇 CHANGE THIS VALUE
    // Currently: 30 * 60 (30 Minutes)
    
    // Option A: 2 Hours (Standard)
    // maxAge: 2 * 60 * 60, 

    // Option B: 8 Hours (Full Work Day)
    // maxAge: 8 * 60 * 60,

    // Option C: 24 Hours (Don't ask for password today)
    // maxAge: 24 * 60 * 60
    maxAge: 12 * 60 * 60, 
  },
  
  // 2. CUSTOM PAGES
  pages: {
    signIn: '/login', // We will build this custom page
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department || "",
          officeId: user.officeId || ""
        };
      }
    })
  ],

  // 3. SECURE CALLBACKS
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.department = user.department;
        token.officeId = user.officeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.department = token.department;
        session.user.officeId = token.officeId;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };