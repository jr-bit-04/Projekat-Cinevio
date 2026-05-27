import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles/global.css";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        gutter={14}
        toastOptions={{
          duration: 3200,
          style: {
            minWidth: "280px",
            maxWidth: "420px",
            padding: "15px 17px",
            borderRadius: "18px",
            background:
              "linear-gradient(180deg, rgba(24,24,42,0.96), rgba(14,14,28,0.98))",
            color: "#ffffff",
            border: "1px solid rgba(184,146,255,0.28)",
            boxShadow:
              "0 24px 70px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(18px)",
            fontWeight: 800,
            lineHeight: 1.45,
          },
          success: {
            duration: 2600,
            icon: "✓",
            style: {
              border: "1px solid rgba(125,211,168,0.34)",
              boxShadow:
                "0 24px 70px rgba(0,0,0,0.52), 0 0 34px rgba(125,211,168,0.12)",
            },
            iconTheme: {
              primary: "#7dd3a8",
              secondary: "#07110e",
            },
          },
          error: {
            duration: 3800,
            icon: "!",
            style: {
              border: "1px solid rgba(255,110,135,0.36)",
              boxShadow:
                "0 24px 70px rgba(0,0,0,0.52), 0 0 34px rgba(255,110,135,0.12)",
            },
            iconTheme: {
              primary: "#ff9eb1",
              secondary: "#1a0710",
            },
          },
          loading: {
            icon: "•",
            style: {
              border: "1px solid rgba(184,146,255,0.38)",
            },
          },
        }}
      />
    </AuthProvider>
  </StrictMode>
);
