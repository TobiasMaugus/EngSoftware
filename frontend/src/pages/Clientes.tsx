import React, { useState, useEffect } from "react";
import { FaUser, FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { api } from "../services/api.ts";
import { Cliente } from "../types";

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busca, setBusca] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
  });

  useEffect(() => {
    carregarClientes();
  }, [pagina, busca]);

  const carregarClientes = async () => {
    try {
      const data = await api.getClientes(pagina, busca);
      setClientes(data.clientes);
      setTotalPaginas(data.totalPages);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (clienteEditando) {
        await api.updateCliente(clienteEditando.id, formData);
        alert("Cliente atualizado com sucesso!");
      } else {
        await api.createCliente(formData);
        alert("Cliente criado com sucesso!");
      }

      setFormData({ nome: "", telefone: "" });
      setClienteEditando(null);
      setMostrarForm(false);
      carregarClientes();
    } catch (error: any) {
      alert("Erro ao salvar cliente: " + error.message);
    }
  };

  const handleEditar = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setFormData({
      nome: cliente.nome,
      telefone: cliente.telefone,
    });
    setMostrarForm(true);
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) {
      return;
    }

    try {
      await api.deleteCliente(id);
      alert("Cliente excluído com sucesso!");
      carregarClientes();
    } catch (error: any) {
      alert("Erro ao excluir cliente: " + error.message);
    }
  };

  const handleCancelar = () => {
    setFormData({ nome: "", telefone: "" });
    setClienteEditando(null);
    setMostrarForm(false);
  };

  return (
    <div className="clientes-page">
      <h1>
        <FaUser /> Gerenciar Clientes
      </h1>

      <div className="controles">
        <div className="busca">
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <FaSearch className="icone-busca" />
        </div>

        <button onClick={() => setMostrarForm(true)} className="btn-primary">
          <FaPlus /> Novo Cliente
        </button>
      </div>

      {mostrarForm && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{clienteEditando ? "Editar" : "Novo"} Cliente</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome:</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Telefone:</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn-primary">
                  {clienteEditando ? "Atualizar" : "Criar"} Cliente
                </button>
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="clientes-list">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="cliente-card">
            <div className="cliente-info">
              <h3>{cliente.nome}</h3>
              <p>Telefone: {cliente.telefone}</p>
              <p>
                Cadastro: {new Date(cliente.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="cliente-actions">
              <button
                onClick={() => handleEditar(cliente)}
                className="btn-edit"
                title="Editar cliente"
              >
                <FaEdit />
              </button>

              <button
                onClick={() => handleExcluir(cliente.id)}
                className="btn-delete"
                title="Excluir cliente"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {clientes.length === 0 && (
        <div className="empty-state">
          <p>Nenhum cliente encontrado.</p>
        </div>
      )}

      <div className="paginacao">
        <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
          Anterior
        </button>
        <span>
          Página {pagina} de {totalPaginas}
        </span>
        <button
          disabled={pagina === totalPaginas}
          onClick={() => setPagina(pagina + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default Clientes;
