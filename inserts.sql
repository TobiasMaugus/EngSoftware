-- Usar o banco de dados
USE loja_ferramentas;

-- Inserir usuários de teste (com seus emails reais do Google)
INSERT INTO usuarios (google_id, nome, email) VALUES
('123456789', 'João Silva', 'joao@gmail.com'),
('987654321', 'Maria Santos', 'maria@gmail.com'),
('555555555', 'Admin User', 'admin@gmail.com');

-- Inserir clientes
INSERT INTO clientes (nome, telefone) VALUES
('Carlos Oliveira', '(11) 99999-1111'),
('Ana Costa', '(11) 99999-2222'),
('Pedro Almeida', '(11) 99999-3333'),
('Juliana Pereira', '(11) 99999-4444'),
('Ricardo Santos', '(11) 99999-5555');

-- Inserir produtos (ferramentas)
INSERT INTO produtos (nome, descricao, preco, estoque) VALUES
('Martelo de Aço', 'Martelo profissional com cabo de madeira', 29.90, 50),
('Chave de Fenda Phillips', 'Jogo com 5 tamanhos diferentes', 45.50, 30),
('Serra Circular', 'Serra elétrica 220V com lâmina de 180mm', 299.90, 15),
('Alicate Universal', 'Alicate de corte e pressão 8 polegadas', 22.80, 40),
('Furadeira Impacto', 'Furadeira sem fio 18V com 2 baterias', 459.90, 20),
('Jogo de Soquetes', '32 peças com maleta organizadora', 89.90, 25),
('Luvas de Proteção', 'Luvas anticorte nível 5', 35.70, 100),
('Trena Laser', 'Trena digital a laser 50m', 199.90, 10),
('Nível a Laser', 'Nível linear crossline 360°', 159.90, 12),
('Parafusadeira', 'Parafusadeira 12V com kit de bits', 129.90, 18);

-- Inserir vendas de exemplo
INSERT INTO vendas (cliente_id, usuario_id, total, data_venda) VALUES
(1, 1, 75.40, '2024-01-15 10:30:00'),
(2, 1, 459.90, '2024-01-16 14:20:00'),
(3, 2, 125.60, '2024-01-17 09:15:00'),
(4, 1, 299.90, '2024-01-18 16:45:00'),
(1, 2, 65.50, '2024-01-19 11:30:00');

-- Inserir itens das vendas
INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
-- Venda 1
(1, 1, 2, 29.90, 59.80),  -- 2 martelos
(1, 4, 1, 22.80, 22.80),  -- 1 alicate
-- Venda 2
(2, 5, 1, 459.90, 459.90), -- 1 furadeira
-- Venda 3
(3, 2, 1, 45.50, 45.50),   -- 1 jogo de chaves
(3, 7, 2, 35.70, 71.40),   -- 2 pares de luvas
-- Venda 4
(4, 3, 1, 299.90, 299.90), -- 1 serra circular
-- Venda 5
(5, 6, 1, 89.90, 89.90),   -- 1 jogo de soquetes
(5, 10, 1, 129.90, 129.90); -- 1 parafusadeira

-- Atualizar o estoque dos produtos vendidos
UPDATE produtos SET estoque = estoque - 2 WHERE id = 1;  -- Martelos
UPDATE produtos SET estoque = estoque - 1 WHERE id = 4;  -- Alicate
UPDATE produtos SET estoque = estoque - 1 WHERE id = 5;  -- Furadeira
UPDATE produtos SET estoque = estoque - 1 WHERE id = 2;  -- Chaves
UPDATE produtos SET estoque = estoque - 2 WHERE id = 7;  -- Luvas
UPDATE produtos SET estoque = estoque - 1 WHERE id = 3;  -- Serra
UPDATE produtos SET estoque = estoque - 1 WHERE id = 6;  -- Soquetes
UPDATE produtos SET estoque = estoque - 1 WHERE id = 10; -- Parafusadeira

-- Mostrar dados inseridos
SELECT 'Usuários inseridos:' AS '';
SELECT * FROM usuarios;

SELECT 'Clientes inseridos:' AS '';
SELECT * FROM clientes;

SELECT 'Produtos inseridos:' AS '';
SELECT * FROM produtos;

SELECT 'Vendas inseridas:' AS '';
SELECT v.*, c.nome as cliente_nome, u.nome as vendedor_nome 
FROM vendas v 
JOIN clientes c ON v.cliente_id = c.id 
JOIN usuarios u ON v.usuario_id = u.id;

SELECT 'Itens de venda inseridos:' AS '';
SELECT iv.*, p.nome as produto_nome 
FROM itens_venda iv 
JOIN produtos p ON iv.produto_id = p.id;