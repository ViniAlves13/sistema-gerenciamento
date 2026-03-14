import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Adicionamos o 'children' aqui nas propriedades recebidas
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  // 1. Se não tem token, chuta de volta pro Login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    
    // 2. Se a rota exigir um nível específico e o usuário não tiver, bloqueia
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      alert('Acesso negado: Você não tem permissão para ver esta página.');
      return <Navigate to="/" replace />;
    }

    // 3. Se passou em tudo, renderiza a página que está dentro dele (o Dashboard)
    return children; 

  } catch (error) {
    // 4. Se o token for inválido, vencido ou adulterado, limpa e manda pro Login
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;