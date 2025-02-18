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

export const auth = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }

        try {
          // API call to authenticate the user
          const response = await login(credentials.email, credentials.password);

          // Ensure the response contains user and token
          if (response?.user && response?.token) {
            return { ...response.user, token: response.token };  // Add token to user object
          }
          return null; // Authentication failed
        } catch (error) {
          console.error("Authentication failed", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',  
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Store the user and token in the JWT
        token = {
          ...token,
          user,  // Store the user in the token
          token: user.token,  // Store the token separately
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Explicitly typing session to allow for token
        session.user = token.user as User;  // Ensure user is properly typed
        session.token = token.token ? String(token.token) : "";  // Add token to session (with fallback)
      }
      return session;
    },
  },
});
