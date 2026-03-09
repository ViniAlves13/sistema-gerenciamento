import { useState, useEffect } from 'react';
import axios from 'axios';

const PerfilTab = () => {
  const [perfilNome, setPerfilNome] = useState('');
  const [perfilEmail, setPerfilEmail] = useState('');
  const [perfilSenha, setPerfilSenha] = useState('');

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users/profile', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setPerfilNome(response.data.name);
      setPerfilEmail(response.data.email);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: perfilNome, email: perfilEmail };
      if (perfilSenha) payload.password = perfilSenha;

      await axios.put('http://localhost:3000/api/users/profile', payload, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      alert('Seu perfil foi atualizado com sucesso!');
      setPerfilSenha(''); 
    } catch (error) {
      alert('Erro ao atualizar o perfil.');
    }
  };

  return (
    <div>
      <h2>Minha Conta</h2>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', maxWidth: '500px' }}>
        <p style={{ marginBottom: '20px', color: '#7f8c8d' }}>Atualize seus dados pessoais e senha de acesso ao sistema.</p>
        
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Meu Nome</label>
            <input type="text" value={perfilNome} onChange={e => setPerfilNome(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Meu E-mail</label>
            <input type="email" value={perfilEmail} onChange={e => setPerfilEmail(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Nova Senha</label>
            <input type="password" value={perfilSenha} onChange={e => setPerfilSenha(e.target.value)} placeholder="Deixe em branco para não alterar" style={inputStyle} />
          </div>
          <button type="submit" style={btnSalvarStyle}>Salvar Minhas Informações</button>
        </form>
      </div>
    </div>
  );
};

const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '15px' };
const labelStyle = { fontSize: '14px', marginBottom: '5px', color: '#555', fontWeight: 'bold' };
const btnSalvarStyle = { padding: '10px 15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' };

export default PerfilTab;