import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Listar todos os produtos (com paginação)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    
    let query = 'SELECT * FROM produtos';
    let countQuery = 'SELECT COUNT(*) as count FROM produtos';
    let params: any[] = [];
    
    if (search) {
      query += ' WHERE nome LIKE ? OR descricao LIKE ?';
      countQuery += ' WHERE nome LIKE ? OR descricao LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    
    query += ' ORDER BY nome LIMIT ? OFFSET ?';
    
    const [produtos] = await pool.execute(
      query,
      [...params, limit, offset]
    );
    
    const [total]: any = await pool.execute(
      countQuery,
      params
    );
    
    res.json({
      produtos,
      total: total[0].count,
      page,
      totalPages: Math.ceil(total[0].count / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Buscar produto por ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const [produtos]: any = await pool.execute(
      'SELECT * FROM produtos WHERE id = ?',
      [id]
    );
    
    if (produtos.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json(produtos[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// Buscar produtos por nome (para autocomplete)
router.get('/buscar/:nome', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { nome } = req.params;
    
    const [produtos] = await pool.execute(
      'SELECT id, nome, preco, estoque FROM produtos WHERE nome LIKE ? AND estoque > 0 LIMIT 10',
      [`%${nome}%`]
    );
    
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Atualizar estoque do produto (apenas via vendas)
router.patch('/:id/estoque', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { quantidade } = req.body;
    
    if (typeof quantidade !== 'number') {
      return res.status(400).json({ error: 'Quantidade é obrigatória' });
    }
    
    // Verificar se o produto existe
    const [produtos]: any = await pool.execute(
      'SELECT * FROM produtos WHERE id = ?',
      [id]
    );
    
    if (produtos.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Atualizar estoque
    await pool.execute(
      'UPDATE produtos SET estoque = estoque + ? WHERE id = ?',
      [quantidade, id]
    );
    
    res.json({ message: 'Estoque atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar estoque' });
  }
});

// Obter estatísticas de produtos
router.get('/estatisticas/geral', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [estatisticas]: any = await pool.execute(`
      SELECT 
        COUNT(*) as total_produtos,
        SUM(estoque) as total_estoque,
        SUM(preco * estoque) as valor_total_estoque
      FROM produtos
    `);
    
    const [baixoEstoque]: any = await pool.execute(
      'SELECT COUNT(*) as produtos_baixo_estoque FROM produtos WHERE estoque < 10'
    );
    
    res.json({
      ...estatisticas[0],
      ...baixoEstoque[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

export default router;