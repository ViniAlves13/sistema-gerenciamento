import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Importação dos seus componentes
import ProdutosTab from '../components/ProdutosTab';
import ClientesTab from '../components/ClientesTab';
import UsuariosTab from '../components/UsuariosTab';
import PerfilTab from '../components/PerfilTab';

// IMPORTAÇÃO CORRETA DA LOGO (Padrão React)
import logoOmni from '../assets/logoOmniGestor.png';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('produtos');
  const [userRole, setUserRole] = useState('');
  const [loggedUserId, setLoggedUserId] = useState('');
  
  // Estados de controle do Menu
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [menuColapsado, setMenuColapsado] = useState(false);

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

  // Define a largura baseada no estado
  const larguraMenu = menuMobileAberto ? '280px' : (menuColapsado ? '85px' : '280px');

  return (
    <div className="d-flex vh-100" style={{ backgroundColor: '#eef2f5', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      
      {/* ========================================== */}
      {/* MENU LATERAL RETRÁTIL                      */}
      {/* ========================================== */}
      <div 
        className={`p-3 d-flex flex-column text-white shadow-lg ${menuMobileAberto ? 'position-fixed h-100 z-3' : 'd-none d-md-flex'}`} 
        style={{ width: larguraMenu, backgroundColor: '#1e2b3c', transition: 'width 0.3s ease' }}
      >
        {/* CABEÇALHO DO MENU E LOGO */}
        <div className={`d-flex ${menuColapsado ? 'justify-content-center' : 'justify-content-between'} align-items-center mb-4 mt-2 w-100`}>
          <div className="d-flex align-items-center gap-2 overflow-hidden" style={{ whiteSpace: 'nowrap' }}>
            
            {/* LOGO FORMATADA (Moldura Branca) USANDO A VARIÁVEL logoOmni */}
            <div className="bg-white rounded-3 d-flex justify-content-center align-items-center shadow-sm flex-shrink-0" style={{ width: '42px', height: '42px', padding: '4px' }}>
              <img 
                src={logoOmni} 
                alt="Logo Omnigestor" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 10%', borderRadius: '4px' }} 
              />
            </div>
            
            {/* Esconde o texto se estiver colapsado */}
            {!menuColapsado && <span className="fs-4 fw-bold text-info fade-in" style={{ letterSpacing: '0.5px' }}>OMNIGESTOR</span>}
          </div>
          
          {/* Botão de Fechar no Mobile */}
          <button className="btn btn-close btn-close-white d-md-none flex-shrink-0" onClick={() => setMenuMobileAberto(false)}></button>
          
          {/* Botão de Encolher no PC */}
          <button 
            className="btn btn-sm text-white border-0 d-none d-md-block opacity-75 hover-opacity-100 flex-shrink-0 ms-2" 
            onClick={() => setMenuColapsado(!menuColapsado)}
            title={menuColapsado ? "Expandir Menu" : "Recolher Menu"}
          >
            {menuColapsado ? '▶' : '◀'}
          </button>
        </div>
        
        {/* LINKS DO MENU */}
        <ul className="nav nav-pills flex-column mb-auto gap-2">
          <li className="nav-item">
            <button 
              className={`nav-link text-start w-100 py-2 fs-6 d-flex align-items-center gap-3 ${menuColapsado ? 'justify-content-center px-0' : ''} ${activeTab === 'produtos' ? 'bg-primary text-white fw-bold shadow-sm' : 'text-white fw-semibold hover-bg-light'}`} 
              onClick={() => trocarAba('produtos')} title="Inventário e Produtos"
            >
              <span className="fs-5">📦</span>
              {!menuColapsado && <span className="fade-in">Inventário e Produtos</span>}
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link text-start w-100 py-2 fs-6 d-flex align-items-center gap-3 ${menuColapsado ? 'justify-content-center px-0' : ''} ${activeTab === 'clientes' ? 'bg-primary text-white fw-bold shadow-sm' : 'text-white fw-semibold hover-bg-light'}`} 
              onClick={() => trocarAba('clientes')} title="Carteira de Clientes"
            >
              <span className="fs-5">👥</span>
              {!menuColapsado && <span className="fade-in">Carteira de Clientes</span>}
            </button>
          </li>
          {userRole === 'super_user' && (
            <li className="nav-item">
              <button 
                className={`nav-link text-start w-100 py-2 fs-6 d-flex align-items-center gap-3 ${menuColapsado ? 'justify-content-center px-0' : ''} ${activeTab === 'usuarios' ? 'bg-primary text-white fw-bold shadow-sm' : 'text-white fw-semibold hover-bg-light'}`} 
                onClick={() => trocarAba('usuarios')} title="Controle de Usuários"
              >
                <span className="fs-5">🛡️</span>
                {!menuColapsado && <span className="fade-in">Controle de Usuários</span>}
              </button>
            </li>
          )}
        </ul>
        
        <hr className="text-secondary opacity-75 mt-4" />
        
        {/* RODAPÉ DO MENU (Perfil e Sair) */}
        <div className="d-flex flex-column gap-3 mb-2">
          {!menuColapsado && (
            <div className="p-2 rounded text-center border border-secondary border-opacity-25 fade-in" style={{ backgroundColor: '#141d29' }}>
              <small className="text-light d-block mb-1">Nível de Acesso</small>
              <span className="fw-bold text-info text-uppercase fs-6">{userRole}</span>
            </div>
          )}

          <button 
            className={`btn w-100 py-2 fw-bold d-flex align-items-center gap-3 ${menuColapsado ? 'justify-content-center px-0' : ''} ${activeTab === 'perfil' ? 'btn-info text-dark shadow-sm' : 'btn-outline-light'}`} 
            onClick={() => trocarAba('perfil')} title="Minha Conta"
          >
            <span className="fs-5">⚙️</span>
            {!menuColapsado && <span className="fade-in">Minha Conta</span>}
          </button>

          <button 
            className={`btn btn-danger w-100 py-2 fw-bold shadow-sm d-flex align-items-center gap-3 ${menuColapsado ? 'justify-content-center px-0' : ''}`} 
            onClick={handleLogout} title="Sair do Sistema"
          >
            <span className="fs-5">🚪</span>
            {!menuColapsado && <span className="fade-in">Sair</span>}
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* ÁREA PRINCIPAL                             */}
      {/* ========================================== */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        
        {/* NAVBAR MOBILE */}
        <div className="d-md-none p-3 d-flex justify-content-between align-items-center shadow-sm" style={{ backgroundColor: '#1e2b3c' }}>
          <div className="d-flex align-items-center gap-2">
            
            {/* LOGO FORMATADA (Mobile) USANDO A VARIÁVEL logoOmni */}
            <div className="bg-white rounded d-flex justify-content-center align-items-center flex-shrink-0" style={{ width: '36px', height: '36px', padding: '2px' }}>
              <img 
                src={logoOmni} 
                alt="Logo Omnigestor" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 10%', borderRadius: '4px' }} 
              />
            </div>
            
            <span className="fs-5 fw-bold text-info">OMNIGESTOR</span>
          </div>
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
              © 2026 Sistema de Gestão Empresarial - OMNIGESTOR.
            </small>
          </footer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;