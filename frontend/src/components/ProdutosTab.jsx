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
      const response = await axios.get('http://localhost:3000/api/products', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setProdutos(response.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchProdutos(); }, []);

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: nomeProd, description: descricaoProd, price: Number(precoProd), stock: Number(estoqueProd) };
      if (editandoProdId) {
        await axios.put(`http://localhost:3000/api/products/${editandoProdId}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      } else {
        await axios.post('http://localhost:3000/api/products', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
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
    if (!window.confirm('Excluir este produto do sistema?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/products/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchProdutos(); 
    } catch (error) { alert('Erro ao deletar.'); }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary-subtle pb-2">
        <h3 className="fw-bold text-dark mb-0" style={{ color: '#1e2b3c' }}>📦 Gestão de Produtos</h3>
        <span className="badge bg-primary rounded-pill px-3 py-2 shadow-sm">
          {produtos.length} Cadastrados
        </span>
      </div>

      {(userRole === 'super_user' || userRole === 'adm') && (
        <div className="card bg-white border-0 shadow-sm mb-4 rounded-3" style={{ borderTop: '4px solid #0d6efd !important' }}>
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h5 className="card-title text-primary fw-bold mb-0">
              {editandoProdId ? '✏️ Editar Produto Selecionado' : '➕ Cadastrar Novo Produto'}
            </h5>
          </div>
          <div className="card-body p-4">
            
            <form onSubmit={handleSubmitProduct} className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-medium text-secondary">Nome do Produto</label>
                <input type="text" className="form-control bg-light" value={nomeProd} onChange={e => setNomeProd(e.target.value)} required placeholder="Ex: Teclado Mecânico" />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-medium text-secondary">Descrição Breve</label>
                <input type="text" className="form-control bg-light" value={descricaoProd} onChange={e => setDescricaoProd(e.target.value)} placeholder="Detalhes do item..." />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label fw-medium text-secondary">Preço (R$)</label>
                <input type="number" step="0.01" className="form-control bg-light" value={precoProd} onChange={e => setPrecoProd(e.target.value)} required placeholder="0.00" />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label fw-medium text-secondary">Estoque</label>
                <input type="number" className="form-control bg-light" value={estoqueProd} onChange={e => setEstoqueProd(e.target.value)} required placeholder="0" />
              </div>
              
              <div className="col-12 d-flex gap-2 justify-content-md-end mt-4">
                {editandoProdId && (
                  <button type="button" className="btn btn-outline-secondary shadow-sm" onClick={limparFormProd}>Cancelar</button>
                )}
                <button type="submit" className={`btn shadow-sm fw-bold ${editandoProdId ? 'btn-warning text-dark' : 'btn-primary'}`}>
                  {editandoProdId ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* TABELA DE PRODUTOS */}
      <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden" style={{ borderTop: '4px solid #6c757d !important' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th className="px-4 py-3 text-secondary border-bottom">Produto</th>
                  <th className="px-4 py-3 text-secondary border-bottom">Descrição</th>
                  <th className="px-4 py-3 text-secondary border-bottom">Preço</th>
                  <th className="px-4 py-3 text-secondary border-bottom">Estoque</th>
                  {(userRole === 'super_user' || userRole === 'adm') && <th className="px-4 py-3 text-secondary border-bottom text-end">Ações</th>}
                </tr>
              </thead>
              <tbody className="border-top-0">
                {produtos.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">Nenhum produto registrado no inventário.</td></tr>
                ) : (
                  produtos.map(produto => (
                    <tr key={produto._id}>
                      <td className="px-4 fw-bold" style={{ color: '#2b3a4a' }}>{produto.name}</td>
                      <td className="px-4 text-muted">{produto.description}</td>
                      <td className="px-4 fw-bold text-success">R$ {produto.price}</td>
                      <td className="px-4">
                        <span className={`badge ${produto.stock > 10 ? 'bg-info text-dark' : 'bg-danger'}`}>
                          {produto.stock} unid.
                        </span>
                      </td>
                      {(userRole === 'super_user' || userRole === 'adm') && (
                        <td className="px-4 text-end">
                          <button onClick={() => handleEditProdClick(produto)} className="btn btn-sm btn-outline-primary me-2 fw-medium shadow-sm">Editar</button>
                          <button onClick={() => handleDeleteProduct(produto._id)} className="btn btn-sm btn-outline-danger fw-medium shadow-sm">Excluir</button>
                        </td>
                      )}
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

export default ProdutosTab;