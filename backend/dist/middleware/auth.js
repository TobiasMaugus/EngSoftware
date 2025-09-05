import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token de acesso necessário' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        // Verificar se usuário ainda existe
        const pool = (await import('../config/database')).default;
        const [users] = await pool.execute('SELECT id, nome, email FROM usuarios WHERE google_id = ?', [decoded.sub]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        req.user = { ...decoded, userId: users[0].id };
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Token inválido' });
    }
};
export const verifyDeletePassword = (req, res, next) => {
    const { deletePassword } = req.body;
    if (deletePassword !== process.env.ADMIN_DELETE_PASSWORD) {
        return res.status(401).json({ error: 'Senha de exclusão incorreta' });
    }
    next();
};
