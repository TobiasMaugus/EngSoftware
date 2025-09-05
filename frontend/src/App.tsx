import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, useAuth } from "./context/authContext.tsx";
import Login from "./pages/Login.tsx";
import Vendas from "./pages/Vendas.tsx";
import Clientes from "./pages/Clientes.tsx";
import Navbar from "./components/NavBar.tsx";
import VendaForm from "./components/VendaForm.tsx";
import "./App.css";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/" />;
};

interface ProcessEnv {
  REACT_APP_API_URL?: string;
  REACT_APP_GOOGLE_CLIENT_ID?: string;
}

declare const process: {
  env: ProcessEnv;
};

function App() {
  return (
    <GoogleOAuthProvider
      clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}
    >
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <div className="container"></div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendas"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <div className="container">
                      <Vendas />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendas/nova"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <div className="container">
                      <VendaForm />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clientes"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <div className="container">
                      <Clientes />
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
