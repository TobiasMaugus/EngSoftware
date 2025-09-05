import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { FaTools, FaGoogle } from "react-icons/fa";
import { useAuth } from "../context/authContext.tsx";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.ts";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Hook do Google login configurado para retornar ID Token
  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit", // ← garante que receba credential (ID Token)
    onSuccess: async (credentialResponse: any) => {
      try {
        // Pegando o ID Token correto
        const idToken = credentialResponse.credential;
        if (!idToken)
          throw new Error("Não foi possível obter o ID Token do Google");

        // Envia para o backend
        const data = await api.loginGoogle(idToken);

        // Atualiza contexto e navega
        login(data.token, data.user);
        navigate("/dashboard");
      } catch (error: any) {
        console.error("Erro no login Google:", error);
        alert("Erro ao fazer login com Google: " + error.message);
      }
    },
    onError: () => {
      alert("Erro ao fazer login com Google");
    },
  });

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <FaTools size={48} />
          <h1>Loja de Ferramentas</h1>
          <p>Sistema de Gerenciamento de Vendas</p>
        </div>

        <div className="login-form">
          <button onClick={() => handleGoogleLogin()} className="btn-google">
            <FaGoogle /> Entrar com Google
          </button>
        </div>

        <div className="login-footer">
          <p>© 2024 Loja de Ferramentas. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
