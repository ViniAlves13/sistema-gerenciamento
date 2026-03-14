import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import ProdutosTab from '../components/ProdutosTab';
import ClientesTab from '../components/ClientesTab';
import UsuariosTab from '../components/UsuariosTab';
import PerfilTab from '../components/PerfilTab';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('produtos');
  const [userRole, setUserRole] = useState('');
  const [loggedUserId, setLoggedUserId] = useState('');
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
        setLoggedUserId(decoded.id);
      } catch (e) { handleLogout(); }
    } else { handleLogout(); }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const trocarAba = (aba) => {
    setActiveTab(aba);
    setMenuMobileAberto(false);
  };

  return (
    <div className="d-flex vh-100" style={{ backgroundColor: '#eef2f5', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      
      {/* MENU LATERAL (Azul Marinho / Slate) - TEXTOS MAIS VISÍVEIS */}
      <div 
        className={`p-3 d-flex flex-column text-white shadow-lg ${menuMobileAberto ? 'position-fixed h-100 z-3 w-75' : 'd-none d-md-flex'}`} 
        style={{ width: '280px', backgroundColor: '#1e2b3c', transition: '0.3s' }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4 mt-2 me-md-auto text-decoration-none w-100">
          <span className="fs-3 fw-bold text-info">📊 GestãoPro</span>
          <button className="btn btn-close btn-close-white d-md-none" onClick={() => setMenuMobileAberto(false)}></button>
        </div>
        
        <ul className="nav nav-pills flex-column mb-auto gap-2">
          <li className="nav-item">
            <button 
              className={`nav-link text-start w-100 py-2 fs-6 ${activeTab === 'produtos' ? 'bg-primary text-white fw-bold shadow-sm' : 'text-white fw-semibold hover-bg-light'}`} 
              onClick={() => trocarAba('produtos')}
            >
              📦 Inventário e Produtos
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link text-start w-100 py-2 fs-6 ${activeTab === 'clientes' ? 'bg-primary text-white fw-bold shadow-sm' : 'text-white fw-semibold'}`} 
              onClick={() => trocarAba('clientes')}
            >
              👥 Carteira de Clientes
            </button>
          </li>
          {userRole === 'super_user' && (
            <li className="nav-item">
              <button 
                className={`nav-link text-start w-100 py-2 fs-6 ${activeTab === 'usuarios' ? 'bg-primary text-white fw-bold shadow-sm' : 'text-white fw-semibold'}`} 
                onClick={() => trocarAba('usuarios')}
              >
                🛡️ Controle de Usuários
              </button>
            </li>
          )}
        </ul>
        
        <hr className="text-secondary opacity-75 mt-4" />
        <div className="d-flex flex-column gap-3 mb-2">
          <div className="p-2 rounded text-center border border-secondary border-opacity-25" style={{ backgroundColor: '#141d29' }}>
            <small className="text-light d-block mb-1">Nível de Acesso</small>
            <span className="fw-bold text-info text-uppercase fs-6">{userRole}</span>
          </div>
          <button className={`btn w-100 py-2 fw-bold ${activeTab === 'perfil' ? 'btn-info text-dark shadow-sm' : 'btn-outline-light'}`} onClick={() => trocarAba('perfil')}>
            👤 Minha Conta
          </button>
          <button className="btn btn-danger w-100 py-2 fw-bold shadow-sm" onClick={handleLogout}>
            Sair do Sistema
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        
        {/* NAVBAR MOBILE */}
        <div className="d-md-none p-3 d-flex justify-content-between align-items-center shadow-sm" style={{ backgroundColor: '#1e2b3c' }}>
          <span className="fs-5 fw-bold text-info">📊 GestãoPro</span>
          <button className="btn btn-outline-light btn-sm fw-bold" onClick={() => setMenuMobileAberto(true)}>☰ Menu</button>
        </div>

        {/* BANNER CORPORATIVO */}
        <div className="d-none d-md-flex align-items-center px-4 shadow-sm" style={{
          height: '110px',
          backgroundImage: `linear-gradient(rgba(13, 110, 253, 0.75), rgba(30, 43, 60, 0.9)), url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexShrink: 0
        }}>
          <div>
            <h4 className="text-white mb-0 fw-bold">Painel de Controle Empresarial</h4>
            <small className="text-light opacity-75">Visão geral e gerenciamento de recursos operacionais</small>
          </div>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className="p-4 overflow-auto w-100 h-100 d-flex flex-column">
          <div className="container-fluid p-0 flex-grow-1" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {activeTab === 'produtos' && <ProdutosTab userRole={userRole} />}
            {activeTab === 'clientes' && <ClientesTab userRole={userRole} />}
            {activeTab === 'usuarios' && userRole === 'super_user' && <UsuariosTab loggedUserId={loggedUserId} />}
            {activeTab === 'perfil' && <PerfilTab />}
          </div>
          
          {/* RODAPÉ DO SISTEMA */}
          <footer className="mt-5 pt-3 text-center" style={{ borderTop: '1px solid #d1d7dc' }}>
            <small className="text-muted fw-medium">
              © 2026 GestãoPro - Sistema de Gerenciamento Integrado. Todos os direitos reservados.
            </small>
          </footer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;