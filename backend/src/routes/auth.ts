import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import pool from '../config/database.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Login com Google
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token do Google é necessário' });
    }

    // Verificar token com Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(401).json({ error: 'Token do Google inválido' });
    }

    const { sub: googleId, name, email } = payload;

    // Verificar se usuário já existe
    const [users]: any = await pool.execute(
      'SELECT * FROM usuarios WHERE google_id = ? OR email = ?',
      [googleId, email]
    );

    let userId;
    
    if (users.length > 0) {
      // Atualizar usuário existente
      userId = users[0].id;
      await pool.execute(
        'UPDATE usuarios SET nome = ?, google_id = ? WHERE id = ?',
        [name, googleId, userId]
      );
    } else {
      // Criar novo usuário
      const [result]: any = await pool.execute(
        'INSERT INTO usuarios (google_id, nome, email) VALUES (?, ?, ?)',
        [googleId, name, email]
      );
      userId = result.insertId;
    }

    // Gerar JWT token
    const jwtToken = jwt.sign(
      { 
        sub: googleId, 
        name, 
        email, 
        userId 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: userId,
        googleId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Erro no login Google:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Verificar token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token é necessário' });
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    
    // Verificar se usuário ainda existe
    const [users]: any = await pool.execute(
      'SELECT id, nome, email FROM usuarios WHERE google_id = ?',
      [decoded.sub]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      valid: true,
      user: users[0]
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  // Como usamos JWT stateless, o logout é feito no cliente
  // apenas removendo o token
  res.json({ message: 'Logout realizado com sucesso' });
});

export default router;