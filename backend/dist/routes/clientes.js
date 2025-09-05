import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();
// Listar todos os clientes (com paginação)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        let query = 'SELECT * FROM clientes';
        let countQuery = 'SELECT COUNT(*) as count FROM clientes';
        let params = [];
        if (search) {
            query += ' WHERE nome LIKE ? OR telefone LIKE ?';
            countQuery += ' WHERE nome LIKE ? OR telefone LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }
        query += ' ORDER BY nome LIMIT ? OFFSET ?';
        const [clientes] = await pool.execute(query, [...params, limit, offset]);
        const [total] = await pool.execute(countQuery, params);
        res.json({
            clientes,
            total: total[0].count,
            page,
            totalPages: Math.ceil(total[0].count / limit)
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
});
// Buscar cliente por ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [clientes] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [id]);
        if (clientes.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        res.json(clientes[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
});
// Criar novo cliente
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { nome, telefone } = req.body;
        if (!nome || !telefone) {
            return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
        }
        const [result] = await pool.execute('INSERT INTO clientes (nome, telefone) VALUES (?, ?)', [nome, telefone]);
        res.status(201).json({
            id: result.insertId,
            message: 'Cliente criado com sucesso'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao criar cliente' });
    }
});
// Atualizar cliente
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, telefone } = req.body;
        if (!nome || !telefone) {
            return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
        }
        // Verificar se o cliente existe
        const [clientes] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [id]);
        if (clientes.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        // Verificar se o cliente tem vendas associadas
        const [vendas] = await pool.execute('SELECT COUNT(*) as count FROM vendas WHERE cliente_id = ?', [id]);
        if (vendas[0].count > 0) {
            return res.status(400).json({
                error: 'Não é possível editar cliente com vendas associadas'
            });
        }
        await pool.execute('UPDATE clientes SET nome = ?, telefone = ? WHERE id = ?', [nome, telefone, id]);
        res.json({ message: 'Cliente atualizado com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
});
// Excluir cliente
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Verificar se o cliente existe
        const [clientes] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [id]);
        if (clientes.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        // Verificar se o cliente tem vendas associadas
        const [vendas] = await pool.execute('SELECT COUNT(*) as count FROM vendas WHERE cliente_id = ?', [id]);
        if (vendas[0].count > 0) {
            return res.status(400).json({
                error: 'Não é possível excluir cliente com vendas associadas'
            });
        }
        await pool.execute('DELETE FROM clientes WHERE id = ?', [id]);
        res.json({ message: 'Cliente excluído com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao excluir cliente' });
    }
});
// Buscar clientes por nome (para autocomplete)
router.get('/buscar/:nome', authenticateToken, async (req, res) => {
    try {
        const { nome } = req.params;
        const [clientes] = await pool.execute('SELECT id, nome, telefone FROM clientes WHERE nome LIKE ? LIMIT 10', [`%${nome}%`]);
        res.json(clientes);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
});
export default router;
