import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authAPI } from "../api/endpoints";

export const AuthContext = createContext();

const decodeToken = (token) => {
  try {
    if (!token || token === "undefined") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const hasAdminRole = (value) => {
  if (!value) return false;

  if (typeof value === "string") {
    return value.toUpperCase().includes("ADMIN");
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasAdminRole(item));
  }

  return false;
};

const isAdminFrom = (user, token) => {
  try {
    if (hasAdminRole(user?.role) || hasAdminRole(user?.user_role)) {
      return true;
    }

    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        const roleSources = [
          decoded.role,
          decoded.user_role,
          decoded.roles,
          decoded.permissions,
        ];

        for (const roleSource of roleSources) {
          if (hasAdminRole(roleSource)) {
            return true;
          }
        }
      }
    }

    return false;
  } catch (e) {
    console.error("isAdminFrom error:", e);
    return false;
  }
};

const normalizeUserData = (raw, fallback = {}) => {
  const source = raw?.user && typeof raw.user === "object" ? raw.user : raw;

  return {
    ...fallback,
    ...source,
    email:
      source?.email ??
      source?.user_email ??
      fallback?.email ??
      "",
    name:
      source?.name ??
      source?.full_name ??
      source?.fullName ??
      source?.username ??
      fallback?.name ??
      fallback?.full_name ??
      "",
    full_name:
      source?.full_name ??
      source?.fullName ??
      source?.name ??
      fallback?.full_name ??
      fallback?.name ??
      "",
    username:
      source?.username ??
      source?.login ??
      fallback?.username ??
      "",
    role:
      source?.role ??
      source?.user_role ??
      fallback?.role ??
      "user",
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const token = localStorage.getItem("token");

  const syncUserState = useCallback((nextUser) => {
    const fallbackUser = (() => {
      try {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : {};
      } catch {
        return {};
      }
    })();

    const normalizedUser = normalizeUserData(nextUser, fallbackUser);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    return normalizedUser;
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await authAPI.me();
    return syncUserState(response.data);
  }, [syncUserState]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        localStorage.removeItem("admin_emails");

        if (!token || token === "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        let storedUserFallback = {};
        if (storedUser && storedUser !== "undefined") {
          try {
            storedUserFallback = JSON.parse(storedUser);
            if (storedUserFallback && Object.keys(storedUserFallback).length > 0) {
              setUser(storedUserFallback);
              setIsAuthenticated(true);
            }
          } catch {
            localStorage.removeItem("user");
          }
        }

        try {
          const response = await authAPI.me();
          const normalizedUser = normalizeUserData(response.data, storedUserFallback);

          setUser(normalizedUser);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(normalizedUser));
        } catch (apiError) {
          console.error("Error fetching user data:", apiError);

          if (apiError?.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setIsAuthenticated(false);
            return;
          }

          if (!storedUserFallback || Object.keys(storedUserFallback).length === 0) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const token = response.data.access_token;
      if (!token) throw new Error("Токен не получен");

      localStorage.setItem("token", token);
      let userData = normalizeUserData(response.data, {
        email,
        role: response.data.role || "user",
      });

      try {
        const meResponse = await authAPI.me();
        if (meResponse?.data) {
          userData = normalizeUserData(meResponse.data, userData);
        }
      } catch (meError) {
        console.error("Error fetching user profile after login:", meError);
      }

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      console.error("Status:", error?.response?.status);
      console.error("Detail:", error?.response?.data);
      throw error;
    }
  };

  const register = async (email, password, full_name) => {
    try {
      await authAPI.register(email, password, full_name, 0);
      const loginRes = await authAPI.login(email, password);

      const token = loginRes.data.access_token;
      if (!token) throw new Error("Токен не получен после логина");

      localStorage.setItem("token", token);

      let userData = normalizeUserData(loginRes.data, {
        email,
        role: loginRes.data.role || "user",
        full_name,
        name: full_name,
      });

      try {
        const meResponse = await authAPI.me();
        if (meResponse?.data) {
          userData = normalizeUserData(meResponse.data, userData);
        }
      } catch (meError) {
        console.error("Error fetching user profile after register:", meError);
      }

      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      console.error("Register failed:", error);
      console.error("Status:", error?.response?.status);
      console.error("Detail:", error?.response?.data);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("cart");
      localStorage.removeItem("admin_emails");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      refreshUser,
      setUserData: syncUserState,
      isAdmin: isAdminFrom(user, token),
    }),
    [user, isAuthenticated, loading, refreshUser, syncUserState, token]
  );

  useEffect(() => {
    if (!loading) {
      console.log("Auth debug:", { user, token, isAdmin: value.isAdmin });
    }
  }, [loading, user, token, value.isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
