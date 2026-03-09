import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Importando os componentes (abas)
import ProdutosTab from '../components/ProdutosTab';
import ClientesTab from '../components/ClientesTab';
import UsuariosTab from '../components/UsuariosTab';
import PerfilTab from '../components/PerfilTab';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('produtos');
  const [userRole, setUserRole] = useState('');
  const [loggedUserId, setLoggedUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
        setLoggedUserId(decoded.id);
      } catch (e) {
        handleLogout();
      }
    } else {
      handleLogout();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Menu Lateral */}
      <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2>Meu Sistema</h2>
        <p style={{ fontSize: '12px', color: '#bdc3c7' }}>Nível: {userRole}</p>
        <hr style={{ width: '100%', marginBottom: '20px' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <button onClick={() => setActiveTab('produtos')} style={btnStyle(activeTab === 'produtos')}>📦 Produtos</button>
          <button onClick={() => setActiveTab('clientes')} style={btnStyle(activeTab === 'clientes')}>👥 Clientes</button>
          {userRole === 'super_user' && (
            <button onClick={() => setActiveTab('usuarios')} style={btnStyle(activeTab === 'usuarios')}>🛡️ Usuários</button>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => setActiveTab('perfil')} style={{ ...btnStyle(activeTab === 'perfil'), backgroundColor: activeTab === 'perfil' ? '#2980b9' : '#34495e' }}>👤 Meu Perfil</button>
          <button onClick={handleLogout} style={{ ...btnStyle(false), backgroundColor: '#e74c3c' }}>Sair do Sistema</button>
        </div>
      </div>

      {/* Área Principal (Renderiza o componente com base na aba ativa) */}
      <div style={{ flex: 1, padding: '30px', backgroundColor: '#f4f6f7', overflowY: 'auto' }}>
        {activeTab === 'produtos' && <ProdutosTab userRole={userRole} />}
        {activeTab === 'clientes' && <ClientesTab userRole={userRole} />}
        {activeTab === 'usuarios' && userRole === 'super_user' && <UsuariosTab loggedUserId={loggedUserId} />}
        {activeTab === 'perfil' && <PerfilTab />}
      </div>
    </div>
  );
};

const btnStyle = (isActive) => ({ padding: '10px', cursor: 'pointer', textAlign: 'left', border: 'none', borderRadius: '5px', backgroundColor: isActive ? '#34495e' : 'transparent', color: 'white', fontSize: '16px' });

export default Dashboard;