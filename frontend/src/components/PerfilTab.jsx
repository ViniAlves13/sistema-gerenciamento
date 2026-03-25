import { useState, useEffect } from 'react';
import axios from 'axios';

const PerfilTab = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('');
  
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await axios.get('https://gestaopro-api-ovgf.onrender.com/api/users/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setNome(response.data.name);
        setEmail(response.data.email);
        setRole(response.data.role);
      } catch (error) {
        console.error('Erro ao carregar dados do perfil', error);
      }
    };
    fetchPerfil();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });

    try {
      const payload = { name: nome, email };
      if (senha) payload.password = senha; 

      await axios.put('https://gestaopro-api-ovgf.onrender.com/api/users/profile', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setMensagem({ tipo: 'success', texto: 'Seus dados foram atualizados com sucesso.' });
      setSenha(''); 
      
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => setMensagem({ tipo: '', texto: '' }), 4000);
    } catch (error) {
      setMensagem({ tipo: 'danger', texto: 'Erro ao atualizar o perfil. Verifique os dados.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getRoleDisplayName = (r) => {
    if (r === 'super_user') return 'Super User (Acesso Total)';
    if (r === 'adm') return 'Administrador do Sistema';
    return 'Usuário Comum';
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary-subtle pb-3">
        <h3 className="fw-bold text-dark mb-0" style={{ color: '#1e2b3c' }}>Configurações da Conta</h3>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          
          {mensagem.texto && (
            <div className={`alert alert-${mensagem.tipo} shadow-sm border-0 fw-medium d-flex align-items-center rounded-4 fs-6 mb-4`} role="alert">
              <span className="fw-bold me-2">{mensagem.tipo === 'success' ? 'Sucesso:' : 'Erro:'}</span> {mensagem.texto}
            </div>
          )}

          <div className="card bg-white border-0 shadow-sm mb-5 rounded-4 overflow-hidden" style={{ borderTop: '5px solid #0dcaf0 !important' }}>
            <div className="card-header bg-white border-bottom-0 pt-5 pb-0 text-center">
              
              {/* Avatar dinâmico com a inicial do usuário */}
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm" style={{ width: '90px', height: '90px', backgroundColor: '#eef2f5', border: '4px solid #0dcaf0' }}>
                <span className="fs-1 fw-bold text-info text-uppercase">{nome ? nome.charAt(0) : 'P'}</span>
              </div>
              
              <h4 className="card-title fw-bold mb-1 text-truncate px-3" style={{ color: '#1e2b3c' }}>Meus Dados</h4>
              <p className="text-muted">Mantenha suas informações de acesso atualizadas</p>
            </div>
            
            <div className="card-body p-4 p-md-5 pt-3">
              <form onSubmit={handleSubmit} className="row g-4">
                
                <div className="col-12 mb-3 d-flex justify-content-center">
                  <div className="bg-light text-dark border px-4 py-3 shadow-sm rounded-3 text-center w-100" style={{ maxWidth: '400px' }}>
                    <span className="fs-6 fw-medium d-block d-sm-inline">Nível de Acesso:</span>
                    <span className="text-info fw-bold fs-6 d-block d-sm-inline ms-sm-2 mt-1 mt-sm-0">
                      {getRoleDisplayName(role)}
                    </span>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-medium text-secondary">Nome Completo</label>
                  <input type="text" className="form-control form-control-lg bg-light" value={nome} onChange={e => setNome(e.target.value)} required />
                </div>
                
                <div className="col-12">
                  <label className="form-label fw-medium text-secondary">E-mail de Acesso</label>
                  <input type="email" className="form-control form-control-lg bg-light" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                
                <div className="col-12 mt-5">
                  <div className="p-4 rounded-4 bg-light border border-secondary-subtle shadow-sm">
                    <label className="form-label fw-bold text-dark mb-1 fs-5">Alterar Senha</label>
                    <p className="text-muted mb-3 small">Preencha apenas se quiser trocar a sua senha atual. Caso contrário, deixe em branco.</p>
                    <input type="password" className="form-control form-control-lg border-secondary" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Nova senha (mínimo 6 caracteres)" />
                  </div>
                </div>
                
                <div className="col-12 d-flex justify-content-center justify-content-md-end mt-5 pt-3 border-top">
                  <button type="submit" className="btn btn-lg btn-info text-dark fw-bold px-5 shadow w-100 w-md-auto text-truncate">
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PerfilTab;