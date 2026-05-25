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
          toastOptions={{
            style: {
              background: "#121220",
              color: "#fff",
              border: "1px solid rgba(184,146,255,0.25)",
            },
          }}
      />
    </AuthProvider>
  </StrictMode>
);