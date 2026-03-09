import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');

  // Se não tem token, chuta de volta pro Login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    
    // Se o nível de acesso do usuário não estiver na lista permitida, bloqueia
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      alert('Acesso negado: Você não tem permissão para ver esta página.');
      return <Navigate to="/" replace />;
    }

    // Se passou em tudo, renderiza a página que ele tentou acessar
    return <Outlet />;
  } catch (error) {
    // Se o token for inválido/adulterado, limpa e manda pro Login
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;