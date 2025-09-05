import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, verifyDeletePassword } from '../middleware/auth.js';
const router = express.Router();
// Listar vendas do usuário logado
router.get('/', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        const [vendas] = await pool.execute(`SELECT v.*, c.nome as cliente_nome 
       FROM vendas v 
       JOIN clientes c ON v.cliente_id = c.id 
       WHERE v.usuario_id = ? 
       ORDER BY v.data_venda DESC 
       LIMIT ? OFFSET ?`, [req.user.userId, limit, offset]);
        const [total] = await pool.execute('SELECT COUNT(*) as count FROM vendas WHERE usuario_id = ?', [req.user.userId]);
        res.json({
            vendas,
            total: total[0].count,
            page,
            totalPages: Math.ceil(total[0].count / limit)
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar vendas' });
    }
});
// Criar nova venda
router.post('/', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { cliente_id, itens } = req.body;
        let total = 0;
        // Verificar estoque e calcular total
        for (const item of itens) {
            const [produto] = await connection.execute('SELECT estoque, preco FROM produtos WHERE id = ?', [item.produto_id]);
            if (produto.length === 0) {
                throw new Error(`Produto ${item.produto_id} não encontrado`);
            }
            if (produto[0].estoque < item.quantidade) {
                throw new Error(`Estoque insuficiente para o produto ${item.produto_id}`);
            }
            const subtotal = produto[0].preco * item.quantidade;
            total += subtotal;
        }
        // Inserir venda
        const [vendaResult] = await connection.execute('INSERT INTO vendas (cliente_id, usuario_id, total) VALUES (?, ?, ?)', [cliente_id, req.user.userId, total]);
        const vendaId = vendaResult.insertId;
        // Inserir itens e atualizar estoque
        for (const item of itens) {
            const [produto] = await connection.execute('SELECT preco FROM produtos WHERE id = ?', [item.produto_id]);
            const subtotal = produto[0].preco * item.quantidade;
            await connection.execute('INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?)', [vendaId, item.produto_id, item.quantidade, produto[0].preco, subtotal]);
            await connection.execute('UPDATE produtos SET estoque = estoque - ? WHERE id = ?', [item.quantidade, item.produto_id]);
        }
        await connection.commit();
        res.status(201).json({ id: vendaId, message: 'Venda realizada com sucesso' });
    }
    catch (error) {
        await connection.rollback();
        res.status(400).json({ error: error.message });
    }
    finally {
        connection.release();
    }
});
// Excluir venda com verificação de senha
router.delete('/:id', authenticateToken, verifyDeletePassword, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { produtosDevolver } = req.body; // Array de IDs de produtos para devolver ao estoque
        // Verificar se a venda pertence ao usuário
        const [venda] = await connection.execute('SELECT * FROM vendas WHERE id = ? AND usuario_id = ?', [id, req.user.userId]);
        if (venda.length === 0) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }
        // Buscar itens da venda
        const [itens] = await connection.execute('SELECT * FROM itens_venda WHERE venda_id = ?', [id]);
        // Devolver ao estoque apenas os produtos selecionados
        for (const item of itens) {
            if (produtosDevolver.includes(item.produto_id)) {
                await connection.execute('UPDATE produtos SET estoque = estoque + ? WHERE id = ?', [item.quantidade, item.produto_id]);
            }
        }
        // Excluir venda (os itens serão excluídos em cascade)
        await connection.execute('DELETE FROM vendas WHERE id = ?', [id]);
        await connection.commit();
        res.json({ message: 'Venda excluída com sucesso' });
    }
    catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Erro ao excluir venda' });
    }
    finally {
        connection.release();
    }
});
// Buscar vendas por intervalo de datas
router.get('/periodo', authenticateToken, async (req, res) => {
    try {
        const { dataInicio, dataFim, page = 1 } = req.query;
        const limit = 20;
        const offset = (Number(page) - 1) * limit;
        const [vendas] = await pool.execute(`SELECT v.*, c.nome as cliente_nome 
       FROM vendas v 
       JOIN clientes c ON v.cliente_id = c.id 
       WHERE v.usuario_id = ? AND v.data_venda BETWEEN ? AND ?
       ORDER BY v.data_venda DESC 
       LIMIT ? OFFSET ?`, [req.user.userId, dataInicio, dataFim, limit, offset]);
        const [total] = await pool.execute('SELECT COUNT(*) as count FROM vendas WHERE usuario_id = ? AND data_venda BETWEEN ? AND ?', [req.user.userId, dataInicio, dataFim]);
        res.json({
            vendas,
            total: total[0].count,
            page: Number(page),
            totalPages: Math.ceil(total[0].count / limit)
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar vendas' });
    }
});
export default router;
