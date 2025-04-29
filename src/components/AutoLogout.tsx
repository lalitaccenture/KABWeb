import { signOut } from "next-auth/react";
import { useEffect } from "react";

const AUTO_LOGOUT_TIME = 60 * 60 * 1000; // 1 hour

let logoutTimer: ReturnType<typeof setTimeout>; 

const AutoLogout: React.FC = () => {
  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        signOut({ callbackUrl: '/' });
      }, AUTO_LOGOUT_TIME);
    };

    // Listen to user activity
    const events: string[] = ['click', 'mousemove', 'keydown', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Start the timer initially
    resetTimer();

    // Clean up listeners on unmount
    return () => {
      clearTimeout(logoutTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null; // This is a utility component, it renders nothing
};

export default AutoLogout;
