import { useState, useEffect } from 'react';
import axios from 'axios';

const UsuariosTab = ({ loggedUserId }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [nomeUsu, setNomeUsu] = useState('');
  const [emailUsu, setEmailUsu] = useState('');
  const [senhaUsu, setSenhaUsu] = useState('');
  const [nivelUsu, setNivelUsu] = useState('usuario_comum');
  const [editandoUsuId, setEditandoUsuId] = useState(null);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setUsuarios(response.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleSubmitUsuario = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: nomeUsu, email: emailUsu, role: nivelUsu };
      if (senhaUsu) payload.password = senhaUsu; 

      if (editandoUsuId) {
        await axios.put(`http://localhost:3000/api/users/${editandoUsuId}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      } else {
        if (!senhaUsu) return alert('Senha obrigatória para novo usuário.');
        await axios.post('http://localhost:3000/api/users', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      }
      limparFormUsu(); fetchUsuarios();
    } catch (error) { alert(error.response?.data?.error || 'Erro ao salvar.'); }
  };

  const handleEditUsuClick = (usu) => {
    setNomeUsu(usu.name); setEmailUsu(usu.email); setNivelUsu(usu.role); setSenhaUsu(''); setEditandoUsuId(usu._id);
  };

  const limparFormUsu = () => { setNomeUsu(''); setEmailUsu(''); setSenhaUsu(''); setNivelUsu('usuario_comum'); setEditandoUsuId(null); };

  return (
    <div>
      <h2>Gerenciamento de Usuários do Sistema</h2>
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f8f5', borderLeft: '5px solid #1abc9c', color: '#16a085' }}>
        <strong>Atenção:</strong> Você está na área de segurança máxima.
      </div>

      <form onSubmit={handleSubmitUsuario} style={formStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 25%' }}><label style={labelStyle}>Nome Completo</label><input type="text" value={nomeUsu} onChange={e => setNomeUsu(e.target.value)} required style={inputStyle} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 25%' }}><label style={labelStyle}>E-mail de Acesso</label><input type="email" value={emailUsu} onChange={e => setEmailUsu(e.target.value)} required style={inputStyle} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 20%' }}><label style={labelStyle}>{editandoUsuId ? 'Nova Senha (Opcional)' : 'Senha Provisória'}</label><input type="password" value={senhaUsu} onChange={e => setSenhaUsu(e.target.value)} style={inputStyle} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 20%' }}><label style={labelStyle}>Nível de Acesso</label>
          <select value={nivelUsu} onChange={e => setNivelUsu(e.target.value)} style={{ ...inputStyle, height: '35px' }}>
            <option value="usuario_comum">Visualizador (Leitura)</option><option value="adm">Administrador</option><option value="super_user">Super User</option>
          </select>
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          {editandoUsuId && <button type="button" onClick={limparFormUsu} style={{ ...actionBtnStyle, backgroundColor: '#95a5a6' }}>Cancelar</button>}
          <button type="submit" style={{ ...actionBtnStyle, backgroundColor: editandoUsuId ? '#f39c12' : '#2ecc71' }}>{editandoUsuId ? 'Atualizar Usuário' : '+ Criar Conta'}</button>
        </div>
      </form>

      <table style={tableStyle}>
        <thead><tr style={{ backgroundColor: '#ecf0f1', textAlign: 'left' }}><th style={thStyle}>Nome</th><th style={thStyle}>E-mail</th><th style={thStyle}>Nível de Acesso</th><th style={thStyle}>Ações</th></tr></thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario._id} style={{ borderBottom: '1px solid #eee' }}><td style={tdStyle}>{usuario.name}</td><td style={tdStyle}>{usuario.email}</td>
              <td style={tdStyle}><span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: usuario.role === 'super_user' ? '#f5b041' : usuario.role === 'adm' ? '#5dade2' : '#aeb6bf', color: 'white' }}>{usuario.role === 'super_user' ? '👑 Super User' : usuario.role === 'adm' ? '🛡️ Adm' : '👀 Visualizador'}</span></td>
              <td style={tdStyle}>
                {(usuario.role !== 'super_user' || usuario._id === loggedUserId) ? (
                  <button onClick={() => handleEditUsuClick(usuario)} style={{ ...actionBtnStyle, backgroundColor: '#3498db' }}>Editar</button>
                ) : <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>Bloqueado</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' };
const formStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-start' };
const labelStyle = { fontSize: '13px', marginBottom: '5px', color: '#555', fontWeight: '500' };
const actionBtnStyle = { padding: '8px 15px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', height: '38px', fontWeight: 'bold' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' };
const thStyle = { padding: '12px 15px', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '12px 15px' };

export default UsuariosTab;