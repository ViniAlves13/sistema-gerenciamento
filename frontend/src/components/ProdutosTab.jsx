import { useState, useEffect } from 'react';
import axios from 'axios';

const ProdutosTab = ({ userRole }) => {
  const [produtos, setProdutos] = useState([]);
  const [nomeProd, setNomeProd] = useState('');
  const [descricaoProd, setDescricaoProd] = useState('');
  const [precoProd, setPrecoProd] = useState('');
  const [estoqueProd, setEstoqueProd] = useState('');
  const [editandoProdId, setEditandoProdId] = useState(null);

  const fetchProdutos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/products', { headers: { Authorization: `Bearer ${token}` } });
      setProdutos(response.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchProdutos(); }, []);

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { name: nomeProd, description: descricaoProd, price: Number(precoProd), stock: Number(estoqueProd) };
      if (editandoProdId) {
        await axios.put(`http://localhost:3000/api/products/${editandoProdId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('http://localhost:3000/api/products', payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      limparFormProd(); fetchProdutos();
    } catch (error) { alert('Erro ao salvar produto.'); }
  };

  const handleEditProdClick = (produto) => {
    setNomeProd(produto.name); setDescricaoProd(produto.description);
    setPrecoProd(produto.price); setEstoqueProd(produto.stock); setEditandoProdId(produto._id);
  };

  const limparFormProd = () => { setNomeProd(''); setDescricaoProd(''); setPrecoProd(''); setEstoqueProd(''); setEditandoProdId(null); };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Deletar produto?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/products/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchProdutos(); 
    } catch (error) { alert('Erro ao deletar.'); }
  };

  return (
    <div>
      <h2>Gerenciamento de Produtos</h2>
      {(userRole === 'super_user' || userRole === 'adm') && (
        <form onSubmit={handleSubmitProduct} style={formStyle}>
          <div style={{ display: 'flex', flexDirection: 'column' }}><label style={labelStyle}>Nome</label><input type="text" value={nomeProd} onChange={e => setNomeProd(e.target.value)} required style={inputStyle} /></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}><label style={labelStyle}>Descrição</label><input type="text" value={descricaoProd} onChange={e => setDescricaoProd(e.target.value)} style={inputStyle} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100px' }}><label style={labelStyle}>Preço</label><input type="number" step="0.01" value={precoProd} onChange={e => setPrecoProd(e.target.value)} required style={inputStyle} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100px' }}><label style={labelStyle}>Estoque</label><input type="number" value={estoqueProd} onChange={e => setEstoqueProd(e.target.value)} required style={inputStyle} /></div>
          <button type="submit" style={{ ...actionBtnStyle, backgroundColor: editandoProdId ? '#f39c12' : '#2ecc71' }}>{editandoProdId ? 'Atualizar' : '+ Adicionar'}</button>
          {editandoProdId && <button type="button" onClick={limparFormProd} style={{ ...actionBtnStyle, backgroundColor: '#95a5a6' }}>Cancelar</button>}
        </form>
      )}
      <table style={tableStyle}>
        <thead><tr style={{ backgroundColor: '#ecf0f1', textAlign: 'left' }}><th style={thStyle}>Nome</th><th style={thStyle}>Descrição</th><th style={thStyle}>Preço</th><th style={thStyle}>Estoque</th>{(userRole === 'super_user' || userRole === 'adm') && <th style={thStyle}>Ações</th>}</tr></thead>
        <tbody>
          {produtos.map(produto => (
            <tr key={produto._id} style={{ borderBottom: '1px solid #eee' }}><td style={tdStyle}>{produto.name}</td><td style={tdStyle}>{produto.description}</td><td style={tdStyle}>R$ {produto.price}</td><td style={tdStyle}>{produto.stock} unid.</td>
              {(userRole === 'super_user' || userRole === 'adm') && (
                <td style={tdStyle}><button onClick={() => handleEditProdClick(produto)} style={{ ...actionBtnStyle, backgroundColor: '#3498db', marginRight: '5px' }}>Editar</button><button onClick={() => handleDeleteProduct(produto._id)} style={{ ...actionBtnStyle, backgroundColor: '#e74c3c' }}>Deletar</button></td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' };
const formStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' };
const labelStyle = { fontSize: '13px', marginBottom: '5px', color: '#555', fontWeight: '500' };
const actionBtnStyle = { padding: '8px 15px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', height: '38px', fontWeight: 'bold' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' };
const thStyle = { padding: '12px 15px', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '12px 15px' };

export default ProdutosTab;