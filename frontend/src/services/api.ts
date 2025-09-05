// Definir interface para process.env
interface ProcessEnv {
  REACT_APP_API_URL?: string;
  REACT_APP_GOOGLE_CLIENT_ID?: string;
}

declare const process: {
  env: ProcessEnv;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Interfaces para as respostas da API
interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface VerifyResponse {
  valid: boolean;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface VendasResponse {
  vendas: Array<{
    id: number;
    data_venda: string;
    total: number;
    cliente_nome: string;
    cliente_id: number;
    usuario_id: number;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

interface ClientesResponse {
  clientes: Array<{
    id: number;
    nome: string;
    telefone: string;
    created_at: string;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

interface ProdutosResponse {
  produtos: Array<{
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    estoque: number;
    created_at: string;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

interface EstatisticasResponse {
  total_produtos: number;
  total_estoque: number;
  valor_total_estoque: number;
  produtos_baixo_estoque: number;
}

export const api = {
  // Autenticação
  loginGoogle: async (token: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    return response.json();
  },

  verifyToken: async (token: string): Promise<VerifyResponse> => {
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    return response.json();
  },

  // Vendas
  getVendas: async (page: number = 1, dataInicio?: string, dataFim?: string): Promise<VendasResponse> => {
    let url = `${API_URL}/api/vendas?page=${page}`;
    if (dataInicio && dataFim) {
      url = `${API_URL}/api/vendas/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}&page=${page}`;
    }
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.json();
  },

  createVenda: async (vendaData: { 
  cliente_id: number; 
  itens: Array<{ 
    produto_id: number; 
    quantidade: number; 
  }>; 
}): Promise<{ id: number; message: string }> => {
  const response = await fetch(`${API_URL}/api/vendas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(vendaData),
  });
  return response.json();
},

  deleteVenda: async (id: number, deletePassword: string, produtosDevolver: number[]): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/vendas/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ deletePassword, produtosDevolver }),
    });
    return response.json();
  },

  // Clientes
  getClientes: async (page: number = 1, search: string = ''): Promise<ClientesResponse> => {
    const url = `${API_URL}/api/clientes?page=${page}&search=${encodeURIComponent(search)}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.json();
  },

  createCliente: async (clienteData: { nome: string; telefone: string }): Promise<{ id: number; message: string }> => {
    const response = await fetch(`${API_URL}/api/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(clienteData),
    });
    return response.json();
  },

  updateCliente: async (id: number, clienteData: { nome: string; telefone: string }): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/clientes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(clienteData),
    });
    return response.json();
  },

  deleteCliente: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/api/clientes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
    });
    return response.json();
  },

  // Produtos
  getProdutos: async (page: number = 1, search: string = ''): Promise<ProdutosResponse> => {
    const url = `${API_URL}/api/produtos?page=${page}&search=${encodeURIComponent(search)}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.json();
  },

  searchProdutos: async (nome: string): Promise<Array<{ id: number; nome: string; preco: number; estoque: number }>> => {
    const response = await fetch(`${API_URL}/api/produtos/buscar/${encodeURIComponent(nome)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.json();
  },

  getEstatisticas: async (): Promise<EstatisticasResponse> => {
    const response = await fetch(`${API_URL}/api/produtos/estatisticas/geral`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.json();
  }
};