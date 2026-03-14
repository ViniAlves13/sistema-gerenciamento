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

  // Função para formatar a cor do crachá (badge) dependendo do nível
  const getRoleBadge = (userRole) => {
    switch(userRole) {
      case 'super_user': return <span className="badge bg-danger">Super User</span>;
      case 'adm': return <span className="badge bg-warning text-dark">Administrador</span>;
      default: return <span className="badge bg-secondary">Comum</span>;
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary-subtle pb-2">
        <h3 className="fw-bold text-dark mb-0" style={{ color: '#1e2b3c' }}>🛡️ Controle de Acessos</h3>
        <span className="badge bg-purple rounded-pill px-3 py-2 shadow-sm" style={{ backgroundColor: '#6f42c1' }}>
          {usuarios.length} Contas
        </span>
      </div>

      <div className="card bg-white border-0 shadow-sm mb-4 rounded-3" style={{ borderTop: '4px solid #6f42c1 !important' }}>
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
          <h5 className="card-title fw-bold mb-0" style={{ color: '#6f42c1' }}>
            {editandoId ? '✏️ Editar Nível de Acesso' : '➕ Conceder Novo Acesso'}
          </h5>
        </div>
        <div className="card-body p-4">
          
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-12 col-md-3">
              <label className="form-label fw-medium text-secondary">Nome Completo</label>
              <input type="text" className="form-control bg-light" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Nome do Funcionário" />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label fw-medium text-secondary">E-mail Corporativo</label>
              <input type="email" className="form-control bg-light" value={email} onChange={e => setEmail(e.target.value)} required placeholder="usuario@empresa.com" />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label fw-medium text-secondary">Senha {editandoId && <small className="text-muted">(Opcional)</small>}</label>
              <input type="password" className="form-control bg-light" value={senha} onChange={e => setSenha(e.target.value)} placeholder={editandoId ? "Deixe em branco para manter" : "Crie uma senha"} />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label fw-medium text-secondary">Nível de Permissão</label>
              <select className="form-select bg-light" value={role} onChange={e => setRole(e.target.value)} required>
                <option value="usuario_comum">Usuário Comum</option>
                <option value="adm">Administrador (ADM)</option>
                <option value="super_user">Super User (Acesso Total)</option>
              </select>
            </div>
            
            <div className="col-12 d-flex gap-2 justify-content-md-end mt-4">
              {editandoId && (
                <button type="button" className="btn btn-outline-secondary shadow-sm" onClick={limparForm}>Cancelar</button>
              )}
              <button type="submit" className={`btn shadow-sm fw-bold ${editandoId ? 'btn-warning text-dark' : 'text-white'}`} style={{ backgroundColor: editandoId ? '' : '#6f42c1' }}>
                {editandoId ? 'Atualizar Permissões' : 'Criar Credencial'}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* TABELA DE USUÁRIOS */}
      <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden" style={{ borderTop: '4px solid #6c757d !important' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th className="px-4 py-3 text-secondary border-bottom">Funcionário</th>
                  <th className="px-4 py-3 text-secondary border-bottom">E-mail de Acesso</th>
                  <th className="px-4 py-3 text-secondary border-bottom">Cargo / Nível</th>
                  <th className="px-4 py-3 text-secondary border-bottom text-end">Gerenciar</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {usuarios.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-5 text-muted">Carregando usuários...</td></tr>
                ) : (
                  usuarios.map(user => (
                    <tr key={user._id}>
                      <td className="px-4 fw-bold" style={{ color: '#2b3a4a' }}>
                        {user.name} {user._id === loggedUserId && <span className="badge bg-light text-dark border ms-2">Você</span>}
                      </td>
                      <td className="px-4 text-muted">{user.email}</td>
                      <td className="px-4">{getRoleBadge(user.role)}</td>
                      <td className="px-4 text-end">
                        <button onClick={() => handleEditClick(user)} className="btn btn-sm btn-outline-primary me-2 fw-medium shadow-sm">Editar</button>
                        <button 
                          onClick={() => handleDelete(user._id)} 
                          className={`btn btn-sm btn-outline-danger fw-medium shadow-sm ${user._id === loggedUserId ? 'disabled opacity-50' : ''}`}
                        >
                          Revogar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuariosTab;