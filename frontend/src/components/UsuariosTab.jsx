import { useState, useEffect } from 'react';
import axios from 'axios';

const UsuariosTab = ({ loggedUserId }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('usuario_comum');
  const [editandoId, setEditandoId] = useState(null);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get('https://gestaopro-api-ovgf.onrender.com/api/users', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setUsuarios(response.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: nome, email, role };
      if (senha) payload.password = senha; // Só envia a senha se foi digitada

      if (editandoId) {
        await axios.put(`https://gestaopro-api-ovgf.onrender.com/api/users/${editandoId}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      } else {
        // Exige senha para criar novo usuário
        if (!senha) return alert('A senha é obrigatória para novos usuários.');
        await axios.post('https://gestaopro-api-ovgf.onrender.com/api/users', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      }
      limparForm(); fetchUsuarios();
    } catch (error) { alert(error.response?.data?.error || 'Erro ao salvar usuário.'); }
  };

  const handleEditClick = (user) => {
    setNome(user.name); setEmail(user.email); setRole(user.role);
    setSenha(''); // Deixa a senha em branco por segurança
    setEditandoId(user._id);
    // Rolagem suave para o topo no iPad
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limparForm = () => { setNome(''); setEmail(''); setSenha(''); setRole('usuario_comum'); setEditandoId(null); };

  // Bloqueia a exclusão do próprio usuário logado
  const handleDelete = async (id) => {
    if (id === loggedUserId) return alert('Você não pode excluir sua própria conta!');
    if (!window.confirm('Atenção: Tem certeza que deseja excluir este acesso?')) return;
    try {
      await axios.delete(`https://gestaopro-api-ovgf.onrender.com/api/users/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchUsuarios(); 
    } catch (error) { alert('Erro ao deletar.'); }
  };

  // Função para formatar a cor do crachá (badge) com tamanho ampliado para touch
  const getRoleBadge = (userRole) => {
    switch(userRole) {
      case 'super_user': return <span className="badge bg-danger shadow-sm px-3 py-2 fs-6">Super User</span>;
      case 'adm': return <span className="badge bg-warning text-dark shadow-sm px-3 py-2 fs-6">Administrador</span>;
      default: return <span className="badge bg-secondary shadow-sm px-3 py-2 fs-6">Comum</span>;
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary-subtle pb-3">
        <h3 className="fw-bold text-dark mb-0" style={{ color: '#1e2b3c' }}>🛡️ Controle de Acessos</h3>
        <span className="badge rounded-pill px-4 py-2 shadow-sm fs-6" style={{ backgroundColor: '#6f42c1' }}>
          {usuarios.length} Contas
        </span>
      </div>

      <div className="card bg-white border-0 shadow-sm mb-5 rounded-4" style={{ borderTop: '5px solid #6f42c1 !important' }}>
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
          <h4 className="card-title fw-bold mb-0" style={{ color: '#6f42c1' }}>
            {editandoId ? '✏️ Editar Nível de Acesso' : '➕ Conceder Novo Acesso'}
          </h4>
        </div>
        <div className="card-body p-4">
          
          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-12 col-md-6">
              <label className="form-label fw-medium text-secondary">Nome Completo</label>
              <input type="text" className="form-control form-control-lg bg-light" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Nome do Funcionário" />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-medium text-secondary">E-mail Corporativo</label>
              <input type="email" className="form-control form-control-lg bg-light" value={email} onChange={e => setEmail(e.target.value)} required placeholder="usuario@empresa.com" />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-medium text-secondary">Senha {editandoId && <small className="text-muted">(Opcional)</small>}</label>
              <input type="password" className="form-control form-control-lg bg-light" value={senha} onChange={e => setSenha(e.target.value)} placeholder={editandoId ? "Deixe em branco para manter" : "Crie uma senha"} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-medium text-secondary">Nível de Permissão</label>
              <select className="form-select form-select-lg bg-light" value={role} onChange={e => setRole(e.target.value)} required>
                <option value="usuario_comum">Usuário Comum</option>
                <option value="adm">Administrador (ADM)</option>
                <option value="super_user">Super User (Acesso Total)</option>
              </select>
            </div>
            
            <div className="col-12 d-flex gap-3 justify-content-md-end mt-5 pt-4 border-top">
              {editandoId && (
                <button type="button" className="btn btn-lg btn-outline-secondary shadow-sm px-4 fw-medium" onClick={limparForm}>
                  ❌ Cancelar
                </button>
              )}
              <button type="submit" className={`btn btn-lg shadow fw-bold px-5 ${editandoId ? 'btn-warning text-dark' : 'text-white'}`} style={{ backgroundColor: editandoId ? '' : '#6f42c1' }}>
                {editandoId ? '✏️ Atualizar Permissões' : '✅ Criar Credencial'}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* ÁREA DE LISTAGEM DE USUÁRIOS */}
      <div className="card bg-white border-0 shadow-sm rounded-4 overflow-hidden" style={{ borderTop: '5px solid #6c757d !important' }}>
        <div className="card-body p-0">
          
          {usuarios.length === 0 ? (
            <div className="text-center py-5 text-muted fs-5">Carregando usuários...</div>
          ) : (
            <>
              {/* --- VERSÃO 1: TABELA (Para PC e iPads em paisagem) --- */}
              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-4 text-secondary border-bottom">Funcionário</th>
                      <th className="px-4 py-4 text-secondary border-bottom">E-mail de Acesso</th>
                      <th className="px-4 py-4 text-secondary border-bottom">Cargo / Nível</th>
                      <th className="px-4 py-4 text-secondary border-bottom text-end">Gerenciar</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {usuarios.map(user => (
                      <tr key={user._id}>
                        <td className="px-4 py-3 fw-bold fs-6" style={{ color: '#2b3a4a' }}>
                          {user.name} {user._id === loggedUserId && <span className="badge bg-light text-primary border border-primary ms-2 shadow-sm">Você</span>}
                        </td>
                        <td className="px-4 py-3 text-muted">{user.email}</td>
                        <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                        <td className="px-4 py-3 text-end">
                          <button onClick={() => handleEditClick(user)} className="btn btn-outline-primary px-3 py-2 me-2 fw-medium shadow-sm rounded-3">
                            ✏️ Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(user._id)} 
                            className={`btn btn-outline-danger px-3 py-2 fw-medium shadow-sm rounded-3 ${user._id === loggedUserId ? 'disabled opacity-50' : ''}`}
                            title={user._id === loggedUserId ? "Você não pode remover seu próprio acesso" : "Revogar acesso"}
                          >
                            🗑️ Revogar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* --- VERSÃO 2: CARTÕES (Para Celular e iPads em retrato estreito) --- */}
              <div className="d-block d-md-none p-3 bg-light">
                {usuarios.map(user => (
                  <div key={user._id} className="card shadow-sm border-0 mb-4 rounded-4">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="fw-bold fs-5" style={{ color: '#2b3a4a' }}>{user.name}</span>
                        {user._id === loggedUserId && <span className="badge bg-primary-subtle text-primary border border-primary shadow-sm">Você</span>}
                      </div>
                      
                      <div className="text-muted mb-3 pb-3 border-bottom">{user.email}</div>
                      
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <span className="text-secondary fw-bold small">Nível de Acesso:</span>
                        {getRoleBadge(user.role)}
                      </div>
                      
                      <div className="d-flex gap-2 border-top pt-4">
                        <button onClick={() => handleEditClick(user)} className="btn btn-outline-primary py-2 w-50 fw-bold shadow-sm rounded-3">
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)} 
                          className={`btn btn-outline-danger py-2 w-50 fw-bold shadow-sm rounded-3 ${user._id === loggedUserId ? 'disabled opacity-50' : ''}`}
                        >
                          🗑️ Revogar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default UsuariosTab;