import { useState, useEffect } from 'react';
import axios from 'axios';

const UsuariosTab = ({ loggedUserId }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('usuario_comum');
  const [editandoId, setEditandoId] = useState(null);

  // Controle do Modal
  const [showModal, setShowModal] = useState(false);

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
      if (senha) payload.password = senha; 

      if (editandoId) {
        await axios.put(`https://gestaopro-api-ovgf.onrender.com/api/users/${editandoId}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      } else {
        if (!senha) return alert('A senha é obrigatória para novos usuários.');
        await axios.post('https://gestaopro-api-ovgf.onrender.com/api/users', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      }
      fecharModal(); 
      fetchUsuarios();
    } catch (error) { alert(error.response?.data?.error || 'Erro ao salvar usuário.'); }
  };

  const handleEditClick = (user) => {
    setNome(user.name); setEmail(user.email); setRole(user.role);
    setSenha(''); 
    setEditandoId(user._id);
    setShowModal(true); // Abre o modal para editar
  };

  const handleAddClick = () => {
    limparForm();
    setShowModal(true); // Abre o modal limpo para cadastrar
  };

  const fecharModal = () => { 
    limparForm();
    setShowModal(false); 
  };

  const limparForm = () => { setNome(''); setEmail(''); setSenha(''); setRole('usuario_comum'); setEditandoId(null); };

  const handleDelete = async (id) => {
    if (id === loggedUserId) return alert('Você não pode excluir sua própria conta!');
    if (!window.confirm('Atenção: Tem certeza que deseja excluir este acesso?')) return;
    try {
      await axios.delete(`https://gestaopro-api-ovgf.onrender.com/api/users/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchUsuarios(); 
    } catch (error) { alert('Erro ao deletar.'); }
  };

  const getRoleBadge = (userRole) => {
    switch(userRole) {
      case 'super_user': return <span className="badge bg-danger shadow-sm px-3 py-2 fs-6">Super User</span>;
      case 'adm': return <span className="badge bg-warning text-dark shadow-sm px-3 py-2 fs-6">Administrador</span>;
      default: return <span className="badge bg-secondary shadow-sm px-3 py-2 fs-6">Comum</span>;
    }
  };

  return (
    <div className="fade-in">
      
      {/* CABEÇALHO */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 border-bottom border-secondary-subtle pb-3 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-2" style={{ color: '#1e2b3c' }}>Controle de Acessos</h3>
          <span className="badge rounded-pill px-4 py-2 shadow-sm fs-6" style={{ backgroundColor: '#6f42c1' }}>
            {usuarios.length} Contas
          </span>
        </div>
        <button onClick={handleAddClick} className="btn btn-lg shadow text-white fw-bold px-4" style={{ backgroundColor: '#6f42c1' }}>
        Novo Usuário
        </button>
      </div>

      {/* GRADE DE USUÁRIOS (PC E MOBILE) */}
      {usuarios.length === 0 ? (
        <div className="text-center py-5 text-muted fs-5 card bg-white border-0 shadow-sm rounded-4">Carregando usuários...</div>
      ) : (
        <div className="row g-4">
          {usuarios.map(user => (
            <div className="col-12 col-md-6 col-xl-4" key={user._id}>
              <div className="card shadow-sm border-0 h-100 rounded-4" style={{ borderTop: '4px solid #6f42c1' }}>
                <div className="card-body p-4 d-flex flex-column">
                  
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="fw-bold fs-5 text-truncate pe-2" style={{ color: '#2b3a4a' }}>{user.name}</span>
                    {user._id === loggedUserId && <span className="badge bg-primary-subtle text-primary border border-primary shadow-sm flex-shrink-0">Você</span>}
                  </div>
                  
                  <div className="text-muted mb-3 pb-3 border-bottom text-truncate" title={user.email}>{user.email}</div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-4 mt-auto">
                    <span className="text-secondary fw-bold small">Permissão:</span>
                    {getRoleBadge(user.role)}
                  </div>
                  
                  <div className="d-flex gap-2 border-top pt-4">
                    <button onClick={() => handleEditClick(user)} className="btn btn-outline-primary py-2 w-50 fw-bold shadow-sm rounded-3">
                    Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id)} 
                      className={`btn btn-outline-danger py-2 w-50 fw-bold shadow-sm rounded-3 ${user._id === loggedUserId ? 'disabled opacity-50' : ''}`}
                    >
                    Revogar
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} aria-hidden="true" onClick={fecharModal}>
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-content rounded-4 border-0 shadow-lg">
                
                <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                  <h4 className="modal-title fw-bold" style={{ color: '#6f42c1' }}>
                    {editandoId ? 'Editar Acesso' : 'Conceder Novo Acesso'}
                  </h4>
                  <button type="button" className="btn-close shadow-none" onClick={fecharModal}></button>
                </div>
                
                <div className="modal-body p-4">
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
                    
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-5 pt-4 border-top w-100">
                      <button type="button" className="btn btn-lg btn-outline-secondary px-4 fw-medium order-2 order-md-1" onClick={fecharModal}>
                      Cancelar
                      </button>
                      <button type="submit" className={`btn btn-lg shadow fw-bold px-5 order-1 order-md-2 ${editandoId ? 'btn-warning text-dark' : 'text-white'}`} style={{ backgroundColor: editandoId ? '' : '#6f42c1' }}>
                        {editandoId ? 'Atualizar Permissões' : 'Criar Credencial'}
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default UsuariosTab;