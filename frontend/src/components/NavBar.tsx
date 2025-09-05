import React from "react";
import { FaTools, FaUser, FaShoppingCart, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/authContext.tsx";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <FaTools />
        <span>Loja de Ferramentas</span>
      </div>

      <div className="nav-links">
        <button
          className={isActive("/dashboard")}
          onClick={() => navigate("/dashboard")}
        >
          <FaTools /> Dashboard
        </button>

        <button
          className={isActive("/vendas")}
          onClick={() => navigate("/vendas")}
        >
          <FaShoppingCart /> Vendas
        </button>

        <button
          className={isActive("/clientes")}
          onClick={() => navigate("/clientes")}
        >
          <FaUser /> Clientes
        </button>
      </div>

      <div className="nav-user">
        <span>Olá, {user?.name}</span>
        <button onClick={handleLogout} className="btn-logout">
          <FaSignOutAlt /> Sair
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
