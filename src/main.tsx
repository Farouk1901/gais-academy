import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Single root render: AppWrapper > BrowserRouter > AuthProvider > App
// BrowserRouter and AuthProvider must NOT be duplicated inside App.tsx
createRoot(document.getElementById("root")!).render(
  <AppWrapper>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </AppWrapper>
);
