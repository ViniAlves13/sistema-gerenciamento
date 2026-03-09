const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Se a rota exige papéis específicos e o usuário não tem, bloqueia.
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Acesso negado: Nível de permissão insuficiente.' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  };
};

module.exports = authMiddleware;