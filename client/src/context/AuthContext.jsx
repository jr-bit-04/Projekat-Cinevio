import { useEffect, useState } from "react";

import api from "../services/api";
import { AuthContext } from "./auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function validateSession() {
      const token = localStorage.getItem("token");

      if (!token) {
        if (isMounted) {
          setUser(null);
          setAuthReady(true);
        }

        return;
      }

      try {
        const res = await api.get("/users/profile");

        if (isMounted) {
          localStorage.setItem("user", JSON.stringify(res.data));
          setUser(res.data);
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setAuthReady(true);
        }
      }
    }

    function handleForcedLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }

    validateSession();
    window.addEventListener("auth:logout", handleForcedLogout);

    return () => {
      isMounted = false;
      window.removeEventListener("auth:logout", handleForcedLogout);
    };
  }, []);

  function login(userData, token) {
    localStorage.setItem("token", token);

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        login,
        logout,
      }}
    >
    {children}
    </AuthContext.Provider>
  );
}
