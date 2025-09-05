import React, { useState, useEffect } from "react";
import { FaTools, FaSearch, FaTrash } from "react-icons/fa";
import { api } from "../services/api.ts";
import { Venda } from "../types";

const Vendas: React.FC = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [senhaExclusao, setSenhaExclusao] = useState("");

  useEffect(() => {
    carregarVendas();
  }, [pagina, dataInicio, dataFim]);

  const carregarVendas = async () => {
    try {
      const data = await api.getVendas(pagina, dataInicio, dataFim);
      setVendas(data.vendas);
      setTotalPaginas(data.totalPages);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
    }
  };

  const handleExcluirVenda = async (id: number) => {
    if (!senhaExclusao) {
      alert("Digite a senha de exclusão");
      return;
    }

    if (!window.confirm("Tem certeza que deseja excluir esta venda?")) {
      return;
    }

    const produtosDevolver: number[] = []; // IDs dos produtos a devolver

    try {
      await api.deleteVenda(id, senhaExclusao, produtosDevolver);
      alert("Venda excluída com sucesso");
      carregarVendas();
    } catch (error: any) {
      alert("Erro ao excluir venda: " + error.message);
    }
  };

  return (
    <div className="vendas-page">
      <h1>
        <FaTools /> Vendas
      </h1>

      <div className="filtros">
        <h3>Filtrar por período:</h3>
        <div className="filtro-data">
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
          <span> até </span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
          <button onClick={carregarVendas} className="btn-search">
            <FaSearch /> Buscar
          </button>
        </div>
      </div>

      <div className="senha-exclusao">
        <input
          type="password"
          placeholder="Senha para exclusão"
          value={senhaExclusao}
          onChange={(e) => setSenhaExclusao(e.target.value)}
        />
      </div>

      <div className="vendas-list">
        {vendas.map((venda) => (
          <div key={venda.id} className="venda-card">
            <div className="venda-info">
              <h3>Venda #{venda.id}</h3>
              <p>Cliente: {venda.cliente_nome}</p>
              <p>Data: {new Date(venda.data_venda).toLocaleDateString()}</p>
              <p>Total: R$ {venda.total.toFixed(2)}</p>
            </div>
            <button
              onClick={() => handleExcluirVenda(venda.id)}
              className="btn-delete"
              title="Excluir venda"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

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

export default Vendas;
