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
      const response = await axios.get('https://gestaopro-api-ovgf.onrender.com/api/products', { 
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
        await axios.put(`https://gestaopro-api-ovgf.onrender.com/api/products/${editandoProdId}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      } else {
        await axios.post('https://gestaopro-api-ovgf.onrender.com/api/products', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      }
      limparFormProd(); fetchProdutos();
    } catch (error) { alert('Erro ao salvar produto.'); }
  };

  const handleEditProdClick = (produto) => {
    setNomeProd(produto.name); setDescricaoProd(produto.description);
    setPrecoProd(produto.price); setEstoqueProd(produto.stock); setEditandoProdId(produto._id);
    // Rolagem suave para o topo do formulário no iPad
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limparFormProd = () => { setNomeProd(''); setDescricaoProd(''); setPrecoProd(''); setEstoqueProd(''); setEditandoProdId(null); };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto do sistema?')) return;
    try {
      await axios.delete(`https://gestaopro-api-ovgf.onrender.com/api/products/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchProdutos(); 
    } catch (error) { alert('Erro ao deletar.'); }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary-subtle pb-3">
        <h3 className="fw-bold text-dark mb-0" style={{ color: '#1e2b3c' }}>📦 Gestão de Produtos</h3>
        <span className="badge bg-primary rounded-pill px-4 py-2 shadow-sm fs-6">
          {produtos.length} Cadastrados
        </span>
      </div>

      {(userRole === 'super_user' || userRole === 'adm') && (
        <div className="card bg-white border-0 shadow-sm mb-5 rounded-4" style={{ borderTop: '5px solid #0d6efd !important' }}>
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h4 className="card-title text-primary fw-bold mb-0">
              {editandoProdId ? '✏️ Editar Produto Selecionado' : '➕ Cadastrar Novo Produto'}
            </h4>
          </div>
          <div className="card-body p-4">
            
            <form onSubmit={handleSubmitProduct} className="row g-4">
              <div className="col-12 col-md-5">
                <label className="form-label fw-medium text-secondary">Nome do Produto</label>
                <input type="text" className="form-control form-control-lg bg-light" value={nomeProd} onChange={e => setNomeProd(e.target.value)} required placeholder="Ex: Teclado Mecânico" />
              </div>
              <div className="col-12 col-md-7">
                <label className="form-label fw-medium text-secondary">Descrição Breve</label>
                <input type="text" className="form-control form-control-lg bg-light" value={descricaoProd} onChange={e => setDescricaoProd(e.target.value)} placeholder="Detalhes do item..." />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label fw-medium text-secondary">Preço (R$)</label>
                <input type="number" step="0.01" className="form-control form-control-lg bg-light" value={precoProd} onChange={e => setPrecoProd(e.target.value)} required placeholder="0.00" />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label fw-medium text-secondary">Estoque</label>
                <input type="number" className="form-control form-control-lg bg-light" value={estoqueProd} onChange={e => setEstoqueProd(e.target.value)} required placeholder="0" />
              </div>
              
              <div className="col-12 d-flex gap-3 justify-content-md-end mt-5 pt-4 border-top">
                {editandoProdId && (
                  <button type="button" className="btn btn-lg btn-outline-secondary shadow-sm px-4 fw-medium" onClick={limparFormProd}>
                    ❌ Cancelar
                  </button>
                )}
                <button type="submit" className={`btn btn-lg shadow text-white fw-bold px-5 ${editandoProdId ? 'btn-warning text-dark' : 'btn-primary'}`}>
                  {editandoProdId ? '✏️ Salvar Alterações' : '✅ Confirmar Cadastro'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ÁREA DE LISTAGEM DE PRODUTOS */}
      <div className="card bg-white border-0 shadow-sm rounded-4 overflow-hidden" style={{ borderTop: '5px solid #6c757d !important' }}>
        <div className="card-body p-0">
          
          {produtos.length === 0 ? (
            <div className="text-center py-5 text-muted fs-5">Nenhum produto registrado no inventário.</div>
          ) : (
            <>
              {/* --- VERSÃO 1: TABELA (Para PC e iPads em paisagem) --- */}
              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-4 text-secondary border-bottom">Produto</th>
                      <th className="px-4 py-4 text-secondary border-bottom">Descrição</th>
                      <th className="px-4 py-4 text-secondary border-bottom">Preço</th>
                      <th className="px-4 py-4 text-secondary border-bottom">Estoque</th>
                      {(userRole === 'super_user' || userRole === 'adm') && <th className="px-4 py-4 text-secondary border-bottom text-end">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {produtos.map(produto => (
                      <tr key={produto._id}>
                        <td className="px-4 py-3 fw-bold fs-6" style={{ color: '#2b3a4a' }}>{produto.name}</td>
                        <td className="px-4 py-3 text-muted">{produto.description || '-'}</td>
                        <td className="px-4 py-3 fw-bold text-success fs-6">R$ {produto.price.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`badge shadow-sm fs-6 px-3 py-2 ${produto.stock > 10 ? 'bg-info text-dark' : 'bg-danger'}`}>
                            {produto.stock} unid.
                          </span>
                        </td>
                        {(userRole === 'super_user' || userRole === 'adm') && (
                          <td className="px-4 py-3 text-end">
                            <button onClick={() => handleEditProdClick(produto)} className="btn btn-outline-primary px-3 py-2 me-2 fw-medium shadow-sm rounded-3">
                              ✏️ Editar
                            </button>
                            <button onClick={() => handleDeleteProduct(produto._id)} className="btn btn-outline-danger px-3 py-2 fw-medium shadow-sm rounded-3">
                              🗑️ Excluir
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* --- VERSÃO 2: CARTÕES (Para Celular e iPads em retrato estreito) --- */}
              <div className="d-block d-md-none p-3 bg-light">
                {produtos.map(produto => (
                  <div key={produto._id} className="card shadow-sm border-0 mb-4 rounded-4">
                    <div className="card-body p-4">
                      <div className="fw-bold fs-4 mb-1" style={{ color: '#2b3a4a' }}>{produto.name}</div>
                      <div className="text-muted mb-3 pb-3 border-bottom">{produto.description || 'Sem descrição'}</div>
                      
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <span className="text-secondary fw-bold d-block small">Preço</span>
                          <span className="fw-bold text-success fs-5">R$ {produto.price.toFixed(2)}</span>
                        </div>
                        <div className="text-end">
                          <span className="text-secondary fw-bold d-block small mb-1">Em Estoque</span>
                          <span className={`badge shadow-sm fs-6 px-3 py-2 ${produto.stock > 10 ? 'bg-info text-dark' : 'bg-danger'}`}>
                            {produto.stock} unid.
                          </span>
                        </div>
                      </div>
                      
                      {(userRole === 'super_user' || userRole === 'adm') && (
                        <div className="d-flex gap-2 border-top pt-4 mt-2">
                          <button onClick={() => handleEditProdClick(produto)} className="btn btn-outline-primary py-2 w-50 fw-bold shadow-sm rounded-3">
                            ✏️ Editar
                          </button>
                          <button onClick={() => handleDeleteProduct(produto._id)} className="btn btn-outline-danger py-2 w-50 fw-bold shadow-sm rounded-3">
                            🗑️ Excluir
                          </button>
                        </div>
                      )}
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

export default ProdutosTab;