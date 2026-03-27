import React, { createContext, useState, useEffect } from "react";
import { authAPI } from "../api/endpoints";

export const AuthContext = createContext();
export const getAdminEmails = () => {
  const stored = localStorage.getItem("admin_emails");
  if (stored) return JSON.parse(stored);
  return ["admin@example.com", "admin@techstore.com"];
};
export const saveAdminEmails = (emails) => {
  localStorage.setItem("admin_emails", JSON.stringify(emails));
};
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
const isAdminFrom = (user, token) => {
  try {
    if (user) {
      if (user.role && String(user.role).toUpperCase() === "ADMIN") return true;
      if (user.isAdmin === true || user.admin === true) return true;
    }

    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        const roles = [decoded.role, decoded.user_role, decoded.roles, decoded?.permissions];
        for (const r of roles) {
          if (!r) continue;
          if (typeof r === "string" && r.toUpperCase().includes("ADMIN")) return true;
          if (Array.isArray(r) && r.some((x) => String(x).toUpperCase().includes("ADMIN"))) return true;
        }
      }
    }

    if (user?.email) {
      const admins = getAdminEmails();
      if (admins.map((e) => e.toLowerCase()).includes(user.email.toLowerCase())) return true;
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
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedUser && storedUser !== "undefined") {
          try {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } catch {
            localStorage.removeItem("user");
          }
        }

        if (token) {
          try {
            const response = await authAPI.me();
            const normalizedUser = normalizeUserData(response.data, JSON.parse(storedUser || "{}"));
            setUser(normalizedUser);
            setIsAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(normalizedUser));
          } catch (apiError) {
            console.error("Error fetching user data:", apiError);
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
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const token = localStorage.getItem("token");

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    isAdmin: isAdminFrom(user, token),
  };

  useEffect(() => {
    if (!loading) {
      console.log("Auth debug:", { user, token, isAdmin: value.isAdmin });
    }
  }, [loading, user, token, value.isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
