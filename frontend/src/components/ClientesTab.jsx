import { useState, useEffect } from 'react';
import axios from 'axios';

const ClientesTab = ({ userRole }) => {
  const [clientes, setClientes] = useState([]);
  const [nomeCli, setNomeCli] = useState('');
  const [emailCli, setEmailCli] = useState('');
  const [telefoneCli, setTelefoneCli] = useState('');
  const [enderecoSalvo, setEnderecoSalvo] = useState('');
  const [cepCli, setCepCli] = useState('');
  const [logradouroCli, setLogradouroCli] = useState('');
  const [numeroCli, setNumeroCli] = useState('');
  const [complementoCli, setComplementoCli] = useState('');
  const [bairroCli, setBairroCli] = useState('');
  const [cidadeCli, setCidadeCli] = useState('');
  const [estadoCli, setEstadoCli] = useState('');
  const [editandoCliId, setEditandoCliId] = useState(null);

  const fetchClientes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/clients', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setClientes(response.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchClientes(); }, []);

  const handleTelefoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, ''); if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`; if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`; setTelefoneCli(v);
  };

  const handleCepChange = async (e) => {
    let v = e.target.value.replace(/\D/g, ''); if (v.length > 8) v = v.slice(0, 8); setCepCli(v);
    if (v.length < 8) { setLogradouroCli(''); setBairroCli(''); setCidadeCli(''); setEstadoCli(''); }
    if (v.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${v}/json/`);
        if (!response.data.erro) { setLogradouroCli(response.data.logradouro); setBairroCli(response.data.bairro); setCidadeCli(response.data.localidade); setEstadoCli(response.data.uf); }
        else { alert('CEP não existe!'); setCepCli(''); }
      } catch (error) { alert('Erro no CEP.'); }
    }
  };

  const handleSubmitCliente = async (e) => {
    e.preventDefault();
    try {
      let enderecoFinal = enderecoSalvo;
      if (!enderecoSalvo) {
        if (!cepCli || !logradouroCli || !numeroCli) return alert('Preencha o CEP e o Número.');
        enderecoFinal = `${logradouroCli}, ${numeroCli}${complementoCli ? ` - ${complementoCli}` : ''}, ${bairroCli}, ${cidadeCli} - ${estadoCli}, CEP: ${cepCli}`;
      }
      const payload = { name: nomeCli, email: emailCli, phone: telefoneCli, address: enderecoFinal };
      if (editandoCliId) { await axios.put(`http://localhost:3000/api/clients/${editandoCliId}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); } 
      else { await axios.post('http://localhost:3000/api/clients', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); }
      limparFormCli(); fetchClientes();
    } catch (error) { alert('Erro ao salvar cliente.'); }
  };

  const handleEditCliClick = (c) => { setNomeCli(c.name); setEmailCli(c.email); setTelefoneCli(c.phone); setEnderecoSalvo(c.address || ''); setCepCli(''); setLogradouroCli(''); setNumeroCli(''); setComplementoCli(''); setBairroCli(''); setCidadeCli(''); setEstadoCli(''); setEditandoCliId(c._id); };
  const limparFormCli = () => { setNomeCli(''); setEmailCli(''); setTelefoneCli(''); setEnderecoSalvo(''); setCepCli(''); setLogradouroCli(''); setNumeroCli(''); setComplementoCli(''); setBairroCli(''); setCidadeCli(''); setEstadoCli(''); setEditandoCliId(null); };

  const handleDeleteCliente = async (id) => {
    if (!window.confirm('Deletar cliente?')) return;
    try { await axios.delete(`http://localhost:3000/api/clients/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); fetchClientes(); } catch (error) { alert('Erro ao deletar cliente.'); }
  };

  return (
    <div>
      <h2>Gerenciamento de Clientes</h2>
      {(userRole === 'super_user' || userRole === 'adm') && (
        <form onSubmit={handleSubmitCliente} style={{ ...formStyle, gap: '15px' }}>
          <div style={{ width: '100%', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '5px', fontWeight: 'bold' }}>Dados Pessoais</div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 30%' }}><label style={labelStyle}>Nome Completo</label><input type="text" value={nomeCli} onChange={e => setNomeCli(e.target.value)} required style={inputStyle} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 30%' }}><label style={labelStyle}>E-mail</label><input type="email" value={emailCli} onChange={e => setEmailCli(e.target.value)} required style={inputStyle} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 20%' }}><label style={labelStyle}>Telefone</label><input type="text" placeholder="(XX) XXXXX-XXXX" value={telefoneCli} onChange={handleTelefoneChange} required style={inputStyle} /></div>
          <div style={{ width: '100%', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: '10px', marginBottom: '5px', fontWeight: 'bold' }}>Endereço</div>
          {enderecoSalvo ? (
            <div style={{ width: '100%', padding: '15px', backgroundColor: '#fdfefe', border: '1px solid #e5e8e8', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '14px', color: '#555' }}><strong>Registrado:</strong> {enderecoSalvo}</span><button type="button" onClick={() => setEnderecoSalvo('')} style={{ padding: '6px 12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Mudar Endereço</button></div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', width: '120px' }}><label style={labelStyle}>CEP</label><input type="text" placeholder="Apenas números" value={cepCli} onChange={handleCepChange} style={inputStyle} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 40%' }}><label style={labelStyle}>Logradouro</label><input type="text" value={logradouroCli} onChange={e => setLogradouroCli(e.target.value)} style={inputStyle} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', width: '80px' }}><label style={labelStyle}>Número</label><input type="text" value={numeroCli} onChange={e => setNumeroCli(e.target.value)} style={inputStyle} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 20%' }}><label style={labelStyle}>Complemento</label><input type="text" value={complementoCli} onChange={e => setComplementoCli(e.target.value)} style={inputStyle} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 25%' }}><label style={labelStyle}>Bairro</label><input type="text" value={bairroCli} onChange={e => setBairroCli(e.target.value)} style={inputStyle} disabled={!!cepCli && bairroCli} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 25%' }}><label style={labelStyle}>Cidade</label><input type="text" value={cidadeCli} onChange={e => setCidadeCli(e.target.value)} style={inputStyle} disabled={!!cepCli && cidadeCli} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', width: '60px' }}><label style={labelStyle}>UF</label><input type="text" value={estadoCli} onChange={e => setEstadoCli(e.target.value)} style={inputStyle} disabled={!!cepCli && estadoCli} /></div>
            </>
          )}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            {editandoCliId && <button type="button" onClick={limparFormCli} style={{ ...actionBtnStyle, backgroundColor: '#95a5a6' }}>Cancelar</button>}
            <button type="submit" style={{ ...actionBtnStyle, backgroundColor: editandoCliId ? '#2980b9' : '#2ecc71' }}>{editandoCliId ? 'Salvar Alterações' : '+ Adicionar Cliente'}</button>
          </div>
        </form>
      )}
      <table style={tableStyle}>
        <thead><tr style={{ backgroundColor: '#ecf0f1', textAlign: 'left' }}><th style={thStyle}>Nome</th><th style={thStyle}>E-mail</th><th style={thStyle}>Telefone</th><th style={thStyle}>Endereço Completo</th>{(userRole === 'super_user' || userRole === 'adm') && <th style={thStyle}>Ações</th>}</tr></thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente._id} style={{ borderBottom: '1px solid #eee' }}><td style={tdStyle}>{cliente.name}</td><td style={tdStyle}>{cliente.email}</td><td style={tdStyle}>{cliente.phone}</td><td style={tdStyle}><small>{cliente.address}</small></td>
              {(userRole === 'super_user' || userRole === 'adm') && (
                <td style={tdStyle}><button onClick={() => handleEditCliClick(cliente)} style={{ ...actionBtnStyle, backgroundColor: '#3498db', marginRight: '5px' }}>Editar</button><button onClick={() => handleDeleteCliente(cliente._id)} style={{ ...actionBtnStyle, backgroundColor: '#e74c3c' }}>Deletar</button></td>
              )}
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

export default ClientesTab;