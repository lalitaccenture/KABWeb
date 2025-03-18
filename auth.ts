import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login } from "./app/utils/api"; 

type User = {
  id: string;
  email: string;
  name?: string;
  token: string;
};

declare module "next-auth" {
  interface User {
    token: string;  
  }

  interface Session {
    user: User;   
    token: string; 
  }
}

const auth = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("inside", credentials)
        if (!credentials?.email || !credentials?.password) {
          
          return null;
        }

        try {
          const response = await login(credentials.email, credentials.password);

          // if (response?.user && response?.token) {
          //   return { ...response.user, token: response.token };
          // }
          if (response?.token) {
            return { ... response, token: response.token };
          }
          return null;
        } catch (error) {
          console.error("Authentication failed", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token = {
          ...token,
          user,
          token: user.token,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = token.user as User;
        session.token = token.token ? String(token.token) : "";
      }
      return session;
    },
  },
});

export default auth;
