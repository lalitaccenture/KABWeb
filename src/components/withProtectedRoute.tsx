// withProtectedRoute.tsx
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";

interface WithProtectedRouteProps {
  children: ReactNode;
}

const WithProtectedRoute = ({ children }: WithProtectedRouteProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If the session is loading, you can show a loading state
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // If the user is not authenticated, redirect them to the login page
  if (!session) {
    // Pass the current path as a redirect URL to the login page
    router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    return null;
  }

  // If authenticated, show the protected content
  return <>{children}</>;
};

export default WithProtectedRoute;
