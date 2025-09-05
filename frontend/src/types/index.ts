export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  created_at: string;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  created_at: string;
}

export interface Venda {
  id: number;
  data_venda: string;
  total: number;
  cliente_nome: string;
  cliente_id: number;
  usuario_id: number;
}

export interface ItemVenda {
  id: number;
  venda_id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  produto_nome?: string;
}

export interface VendaCompleta extends Venda {
  itens: ItemVenda[];
}