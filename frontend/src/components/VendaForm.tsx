import React, { useState, useEffect } from "react";
import { FaTools, FaPlus, FaMinus } from "react-icons/fa";
import { api } from "../services/api.ts";
import { Produto, Cliente, ItemVenda } from "../types";

// Interface para o item temporário no formulário
interface ItemVendaForm {
  produto_id: number;
  quantidade: number;
  preco_unitario?: number;
  subtotal?: number;
}

const VendaForm: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clienteId, setClienteId] = useState<number>(0);
  const [itens, setItens] = useState<ItemVendaForm[]>([]);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    fetchClientes();
    fetchProdutos();
  }, []);

  const fetchClientes = async () => {
    try {
      const data = await api.getClientes(1, "");
      setClientes(data.clientes);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const fetchProdutos = async () => {
    try {
      const data = await api.getProdutos(1, "");
      setProdutos(data.produtos);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const adicionarItem = () => {
    setItens([...itens, { produto_id: 0, quantidade: 1 }]);
  };

  const removerItem = (index: number) => {
    const novosItens = [...itens];
    novosItens.splice(index, 1);
    setItens(novosItens);
    calcularTotal(novosItens);
  };

  const atualizarItem = (index: number, campo: string, valor: any) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };

    // Se mudou o produto, atualizar o preço unitário
    if (campo === "produto_id" && valor !== 0) {
      const produto = produtos.find((p) => p.id === valor);
      if (produto) {
        novosItens[index].preco_unitario = produto.preco;
        novosItens[index].subtotal =
          produto.preco * (novosItens[index].quantidade || 1);
      }
    }

    // Se mudou a quantidade, atualizar o subtotal
    if (campo === "quantidade" && novosItens[index].preco_unitario) {
      novosItens[index].subtotal = novosItens[index].preco_unitario * valor;
    }

    setItens(novosItens);
    calcularTotal(novosItens);
  };

  const calcularTotal = (itensVenda: ItemVendaForm[]) => {
    let totalVenda = 0;
    itensVenda.forEach((item) => {
      if (item.subtotal) {
        totalVenda += item.subtotal;
      } else if (item.produto_id && item.quantidade) {
        const produto = produtos.find((p) => p.id === item.produto_id);
        if (produto) {
          totalVenda += produto.preco * item.quantidade;
        }
      }
    });
    setTotal(totalVenda);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (itens.length === 0) {
      alert("Adicione pelo menos um produto à venda");
      return;
    }

    try {
      // Converter para o tipo que a API espera
      const itensParaAPI = itens.map((item) => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
      }));

      await api.createVenda({ cliente_id: clienteId, itens: itensParaAPI });
      alert("Venda realizada com sucesso!");
      setItens([]);
      setClienteId(0);
      setTotal(0);
    } catch (error: any) {
      alert("Erro ao realizar venda: " + error.message);
    }
  };

  return (
    <div className="venda-form">
      <h2>
        <FaTools /> Nova Venda
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Cliente:</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(Number(e.target.value))}
            required
          >
            <option value={0}>Selecione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="itens-venda">
          <h3>Produtos</h3>
          <button type="button" onClick={adicionarItem} className="btn-add">
            <FaPlus /> Adicionar Produto
          </button>

          {itens.map((item, index) => (
            <div key={index} className="item-venda">
              <select
                value={item.produto_id}
                onChange={(e) =>
                  atualizarItem(index, "produto_id", Number(e.target.value))
                }
                required
              >
                <option value={0}>Selecione um produto</option>
                {produtos.map((produto) => (
                  <option
                    key={produto.id}
                    value={produto.id}
                    disabled={produto.estoque <= 0}
                  >
                    {produto.nome} - R$ {produto.preco} (Estoque:{" "}
                    {produto.estoque})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={item.quantidade}
                onChange={(e) => {
                  const quantidade = Number(e.target.value);
                  const produto = produtos.find(
                    (p) => p.id === item.produto_id
                  );

                  if (produto && quantidade > produto.estoque) {
                    alert("Quantidade maior que o estoque disponível");
                    return;
                  }

                  atualizarItem(index, "quantidade", quantidade);
                }}
                required
              />

              <span className="subtotal">
                R$ {item.subtotal ? item.subtotal.toFixed(2) : "0.00"}
              </span>

              <button
                type="button"
                onClick={() => removerItem(index)}
                className="btn-remove"
              >
                <FaMinus />
              </button>
            </div>
          ))}
        </div>

        <div className="total">
          <h3>Total: R$ {total.toFixed(2)}</h3>
        </div>

        <button type="submit" className="btn-submit">
          Finalizar Venda
        </button>
      </form>
    </div>
  );
};

export default VendaForm;
