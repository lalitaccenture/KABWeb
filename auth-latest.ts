import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { login } from "./app/utils/api";

const DEF_STATE = "California";

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

export default NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
          response_type: 'code',
          prompt: 'select_account',
        },
        
      },
       idToken: true,
      
      async profile(profile) {
       //  console.log("Profile", profile);
        // Custom profile mapping, you can choose what fields you need.
        return {
          id: profile.oid,
          email: profile.preferred_username, // Azure AD uses `preferred_username` as email
          name: profile.displayName || profile.given_name, // You may also use `given_name` or `displayName`
          token: "", // Store the access token in the user object
          state : DEF_STATE
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
       //  console.log("credentials", credentials);
        const user = await login(credentials!.email, credentials!.password);
        if (user?.token) {
          return user;
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
     //  console.log("user,callbacks", user);  // Debugging user object
     //  console.log("token, callbacks", token);  // Debugging token object

      console.log(account, "Account");
      if (account?.provider === "azure-ad") {
        token.token = account.access_token;
      }

      // If the user is authenticated, update the token
      if (user) {
        token = {
          ...token,
          user,
          token: user.token,  // Add user token here
        };
      }
      return token;
    },
    /* handling Seessison */
    async session({ session, token }) {
     //  console.log("session,session", session);  // Debugging session object
     //  console.log("token,session", token);  // Debugging token object

      if (token) {
        session.user = token.user as User;
        session.token = token.token ? String(token.token) : "";  // Ensure session token is a string
        if (token.accessToken) {
          (session as any).accessToken = token.accessToken;
        }
      }
      return session;
    },
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
});