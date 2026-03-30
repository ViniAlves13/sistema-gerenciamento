import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';

const ProdutosTab = ({ userRole }) => {
  const [produtos, setProdutos] = useState([]);
  
  const [nomeProd, setNomeProd] = useState('');
  const [descricaoProd, setDescricaoProd] = useState('');
  const [precoProd, setPrecoProd] = useState('');
  const [estoqueProd, setEstoqueProd] = useState('');
  const [editandoProdId, setEditandoProdId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do Modal de Exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState(null);

  const fetchProdutos = async () => {
    try {
      const response = await axios.get('https://gestaopro-api-ovgf.onrender.com/api/products', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setProdutos(response.data);
    } catch (error) { 
      toast.error('Erro ao buscar produtos do servidor.', { duration: 2000 });
    }
  };

  useEffect(() => { fetchProdutos(); }, []);

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = { name: nomeProd, description: descricaoProd, price: Number(precoProd), stock: Number(estoqueProd) };
      
      if (editandoProdId) {
        await axios.put(`https://gestaopro-api-ovgf.onrender.com/api/products/${editandoProdId}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        toast.success('Produto atualizado com sucesso!', { duration: 2000 });
      } else {
        await axios.post('https://gestaopro-api-ovgf.onrender.com/api/products', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        toast.success('Produto cadastrado com sucesso!', { duration: 2000 });
      }
      
      // DESLIGA O LOADING ANTES DE MANDAR FECHAR O MODAL
      setIsLoading(false);
      fecharModal(); 
      fetchProdutos();
    } catch (error) { 
      setIsLoading(false);
      toast.error('Erro ao salvar produto.', { duration: 2000 }); 
    }
  };

  const handleEditProdClick = (produto) => {
    setNomeProd(produto.name); 
    setDescricaoProd(produto.description || '');
    setPrecoProd(produto.price); 
    setEstoqueProd(produto.stock); 
    setEditandoProdId(produto._id);
    setShowModal(true); 
  };

  const handleAddClick = () => {
    limparForm();
    setShowModal(true);
  };

  const limparForm = () => {
    setNomeProd(''); setDescricaoProd(''); setPrecoProd(''); setEstoqueProd(''); setEditandoProdId(null); 
  };

  const fecharModal = () => { 
    if (!isLoading) {
      limparForm();
      setShowModal(false);
    }
  };

  const confirmDelete = (produto) => {
    setProdutoToDelete(produto);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`https://gestaopro-api-ovgf.onrender.com/api/products/${produtoToDelete._id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('O produto foi deletado!', { duration: 2000 });
      fetchProdutos(); 
      setShowDeleteModal(false);
    } catch (error) { 
      toast.error('Erro ao deletar produto.', { duration: 2000 }); 
    }
  };

  return (
    <div className="fade-in">
      
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 border-bottom border-secondary-subtle pb-3 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-2" style={{ color: '#1e2b3c' }}>Registro de Produtos</h3>
          <span className="badge bg-primary rounded-pill px-4 py-2 shadow-sm fs-6">
            {produtos.length} Cadastrados
          </span>
        </div>
        {(userRole === 'super_user' || userRole === 'adm') && (
          <button onClick={handleAddClick} className="btn btn-lg shadow text-white fw-bold px-4 btn-primary">
          + Novo Produto
          </button>
        )}
      </div>

      <div className="card bg-white border-0 shadow-sm rounded-4 overflow-hidden" style={{ borderTop: '5px solid #6c757d !important' }}>
        <div className="card-body p-0">
          {produtos.length === 0 ? (
            <div className="text-center py-5 text-muted fs-5">Nenhum produto registrado no inventário.</div>
          ) : (
            <>
              {/* TABELA PC */}
              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-4 text-secondary border-bottom">Produto</th>
                      <th className="px-4 py-4 text-secondary border-bottom">Descrição</th>
                      <th className="px-4 py-4 text-secondary border-bottom">Preço</th>
                      <th className="px-4 py-4 text-secondary border-bottom">Estoque</th>
                      {(userRole === 'super_user' || userRole === 'adm') && <th className="px-4 py-4 text-secondary border-bottom text-center">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {produtos.map(produto => (
                      <tr key={produto._id}>
                        <td className="px-4 py-3 fw-bold fs-6" style={{ color: '#2b3a4a' }}>{produto.name}</td>
                        <td className="px-4 py-3 text-muted">{produto.description || '-'}</td>
                        <td className="px-4 py-3 fw-bold text-success fs-6">R$ {Number(produto.price).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`badge shadow-sm fs-6 px-3 py-2 ${produto.stock > 10 ? 'bg-info text-dark' : 'bg-danger'}`}>
                            {produto.stock} unid.
                          </span>
                        </td>
                        {(userRole === 'super_user' || userRole === 'adm') && (
                          <td className="px-4 py-3">
                            <div className="d-flex justify-content-center gap-2">
                              <button onClick={() => handleEditProdClick(produto)} className="btn btn-outline-primary p-2 shadow-sm rounded-3" title="Editar">
                                <Pencil size={18} />
                              </button>
                              <button onClick={() => confirmDelete(produto)} className="btn btn-outline-danger p-2 shadow-sm rounded-3" title="Excluir">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CARTÕES MOBILE */}
              <div className="d-block d-md-none p-3 bg-light">
                {produtos.map(produto => (
                  <div key={produto._id} className="card shadow-sm border-0 mb-4 rounded-4">
                     <div className="card-body p-4">
                        
                        <div className="fw-bold fs-4 mb-1" style={{ color: '#2b3a4a' }}>{produto.name}</div>
                        <div className="text-muted small mb-3 pb-3 border-bottom">{produto.description || 'Sem descrição'}</div>
                        
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <div>
                            <span className="text-secondary fw-bold d-block small">Preço</span>
                            <span className="fw-bold text-success fs-5">R$ {Number(produto.price).toFixed(2)}</span>
                          </div>
                          <div className="text-end">
                            <span className="text-secondary fw-bold d-block small mb-1">Em Estoque</span>
                            <span className={`badge shadow-sm fs-6 px-3 py-2 ${produto.stock > 10 ? 'bg-info text-dark' : 'bg-danger'}`}>
                              {produto.stock} unid.
                            </span>
                          </div>
                        </div>

                        {(userRole === 'super_user' || userRole === 'adm') && (
                          <div className="d-flex justify-content-end gap-2 border-top pt-4">
                            <button onClick={() => handleEditProdClick(produto)} className="btn btn-outline-primary px-4 py-2 shadow-sm rounded-3" title="Editar">
                              <Pencil size={20} />
                            </button>
                            <button onClick={() => confirmDelete(produto)} className="btn btn-outline-danger px-4 py-2 shadow-sm rounded-3" title="Excluir">
                              <Trash2 size={20} />
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

      {/* MODAL DE CADASTRO E EDIÇÃO COM LOADING */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-content rounded-4 border-0 shadow-lg">
                
                <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                  <h4 className={`modal-title fw-bold ${editandoProdId ? 'text-warning text-dark' : 'text-primary'}`}>
                    {editandoProdId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                  </h4>
                  <button type="button" className="btn-close shadow-none" onClick={fecharModal} disabled={isLoading}></button>
                </div>
                
                <div className="modal-body p-4">
                  <form onSubmit={handleSubmitProduct} className="row g-4">
                    <div className="col-12 col-md-5">
                      <label className="form-label fw-medium text-secondary">Nome do Produto</label>
                      <input type="text" className="form-control form-control-lg bg-light" value={nomeProd} onChange={e => setNomeProd(e.target.value)} required placeholder="Ex: Teclado Mecânico" disabled={isLoading} />
                    </div>
                    <div className="col-12 col-md-7">
                      <label className="form-label fw-medium text-secondary">Descrição</label>
                      <input type="text" className="form-control form-control-lg bg-light" value={descricaoProd} onChange={e => setDescricaoProd(e.target.value)} placeholder="Detalhes do item..." disabled={isLoading} />
                    </div>
                    <div className="col-6 col-md-6">
                      <label className="form-label fw-medium text-secondary">Preço (R$)</label>
                      <input type="number" step="0.01" className="form-control form-control-lg bg-light" value={precoProd} onChange={e => setPrecoProd(e.target.value)} required placeholder="0.00" disabled={isLoading} />
                    </div>
                    <div className="col-6 col-md-6">
                      <label className="form-label fw-medium text-secondary">Estoque</label>
                      <input type="number" className="form-control form-control-lg bg-light" value={estoqueProd} onChange={e => setEstoqueProd(e.target.value)} required placeholder="0" disabled={isLoading} />
                    </div>
                    
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4 pt-3 border-top w-100">
                      <button type="button" className="btn btn-lg btn-outline-secondary px-4 fw-medium order-2 order-md-1" onClick={fecharModal} disabled={isLoading}>
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className={`btn btn-lg fw-bold px-5 shadow-sm order-1 order-md-2 d-flex justify-content-center align-items-center ${editandoProdId ? 'btn-warning text-dark' : 'btn-primary text-white'}`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Aguarde...
                          </>
                        ) : (
                          editandoProdId ? 'Salvar Alterações' : 'Confirmar Cadastro'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {showDeleteModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1060 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1065 }} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                  <h5 className="modal-title fw-bold text-danger">Confirmar Exclusão</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowDeleteModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <p className="mb-0 fs-5 text-dark">Tem certeza que deseja apagar o registro de <strong>{produtoToDelete?.name}</strong>?</p>
                  <div className="alert alert-warning mt-3 mb-0 border-0 shadow-sm" role="alert">
                    <strong>Ação sem volta:</strong> O produto será permanentemente removido do inventário.
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                  <button type="button" className="btn btn-light fw-medium px-4" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                  <button type="button" className="btn btn-danger fw-bold px-4" onClick={executeDelete}>Sim, Deletar Produto</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default ProdutosTab;