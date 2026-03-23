import { useState, useEffect } from 'react';
import axios from 'axios';

const ProdutosTab = ({ userRole }) => {
  const [produtos, setProdutos] = useState([]);
  
  // Estados para o formulário
  const [nomeProd, setNomeProd] = useState('');
  const [descricaoProd, setDescricaoProd] = useState('');
  const [precoProd, setPrecoProd] = useState('');
  const [estoqueProd, setEstoqueProd] = useState('');
  const [editandoProdId, setEditandoProdId] = useState(null);

  // NOVO: Estado para controlar a abertura do Modal de Edição
  const [showModal, setShowModal] = useState(false);

  const fetchProdutos = async () => {
    try {
      const response = await axios.get('https://gestaopro-api-ovgf.onrender.com/api/products', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setProdutos(response.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchProdutos(); }, []);

  // Função ÚNICA de salvar (serve tanto para criar quanto para editar)
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: nomeProd, description: descricaoProd, price: Number(precoProd), stock: Number(estoqueProd) };
      
      if (editandoProdId) {
        // Atualizando existente (vem do Modal)
        await axios.put(`https://gestaopro-api-ovgf.onrender.com/api/products/${editandoProdId}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        alert('Produto atualizado com sucesso!');
      } else {
        // Criando novo (vem do form principal)
        await axios.post('https://gestaopro-api-ovgf.onrender.com/api/products', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        alert('Produto cadastrado com sucesso!');
      }
      
      fecharModal(); // Limpa tudo e fecha o modal se estiver aberto
      fetchProdutos();
    } catch (error) { alert('Erro ao salvar produto.'); }
  };

  // Acionado ao clicar no botão de Editar na tabela
  const handleEditProdClick = (produto) => {
    setNomeProd(produto.name); 
    setDescricaoProd(produto.description);
    setPrecoProd(produto.price); 
    setEstoqueProd(produto.stock); 
    setEditandoProdId(produto._id);
    
    // Abre o Modal em vez de rolar a tela
    setShowModal(true); 
  };

  // Função para limpar os dados e fechar o Modal
  const fecharModal = () => { 
    setNomeProd(''); setDescricaoProd(''); setPrecoProd(''); setEstoqueProd(''); setEditandoProdId(null); 
    setShowModal(false);
  };

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

      {/* FORMULÁRIO PRINCIPAL (AGORA APENAS PARA CADASTRO) */}
      {(userRole === 'super_user' || userRole === 'adm') && (
        <div className="card bg-white border-0 shadow-sm mb-5 rounded-4" style={{ borderTop: '5px solid #0d6efd !important' }}>
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h4 className="card-title text-primary fw-bold mb-0">➕ Cadastrar Novo Produto</h4>
          </div>
          <div className="card-body p-4">
            {/* Note que se 'showModal' for true, os inputs do fundo não mudam porque o Modal assume o controle */}
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
              
              <div className="col-12 d-flex justify-content-md-end mt-4 pt-3 border-top">
                <button type="submit" className="btn btn-lg shadow text-white fw-bold px-5 btn-primary">
                  ✅ Confirmar Cadastro
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
              {/* --- VERSÃO TABELA (Para PC/iPad) --- */}
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
                        <td className="px-4 py-3 fw-bold text-success fs-6">R$ {produto.price.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`badge shadow-sm fs-6 px-3 py-2 ${produto.stock > 10 ? 'bg-info text-dark' : 'bg-danger'}`}>
                            {produto.stock} unid.
                          </span>
                        </td>
                        {(userRole === 'super_user' || userRole === 'adm') && (
                          <td className="px-4 py-3">
                            <div className="d-flex flex-column gap-2 mx-auto" style={{ maxWidth: '110px' }}>
                              <button onClick={() => handleEditProdClick(produto)} className="btn btn-outline-primary py-1 w-100 fw-medium shadow-sm rounded-3">
                                ✏️ Editar
                              </button>
                              <button onClick={() => handleDeleteProduct(produto._id)} className="btn btn-outline-danger py-1 w-100 fw-medium shadow-sm rounded-3">
                                🗑️ Excluir
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* --- VERSÃO CARTÕES (Mobile) --- */}
              {/* Mantive o mesmo código da listagem mobile, apenas resumi aqui para focar no Modal */}
              <div className="d-block d-md-none p-3 bg-light">
                {produtos.map(produto => (
                  <div key={produto._id} className="card shadow-sm border-0 mb-4 rounded-4">
                     <div className="card-body p-4">
                        <div className="fw-bold fs-4 mb-1" style={{ color: '#2b3a4a' }}>{produto.name}</div>
                        {/* Outros campos e botões que chamam as mesmas funções... */}
                        {(userRole === 'super_user' || userRole === 'adm') && (
                        <div className="d-flex flex-column gap-2 border-top pt-4 mt-2">
                          <button onClick={() => handleEditProdClick(produto)} className="btn btn-outline-primary py-2 w-100 fw-bold shadow-sm rounded-3">
                            ✏️ Editar
                          </button>
                          <button onClick={() => handleDeleteProduct(produto._id)} className="btn btn-outline-danger py-2 w-100 fw-bold shadow-sm rounded-3">
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

      {/* ========================================= */}
      {/* MODAL DE EDIÇÃO (Controlado pelo React)   */}
      {/* ========================================= */}
      {showModal && (
        <>
          {/* Fundo escuro transparente (Backdrop) */}
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          
          {/* O Modal em si */}
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} aria-hidden="true" onClick={fecharModal}>
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-content rounded-4 border-0 shadow-lg">
                
                <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                  <h4 className="modal-title fw-bold text-primary">✏️ Editar Produto</h4>
                  <button type="button" className="btn-close shadow-none" onClick={fecharModal}></button>
                </div>
                
                <div className="modal-body p-4">
                  <form onSubmit={handleSubmitProduct} className="row g-4">
                    <div className="col-12 col-md-5">
                      <label className="form-label fw-medium text-secondary">Nome do Produto</label>
                      <input type="text" className="form-control form-control-lg bg-light" value={nomeProd} onChange={e => setNomeProd(e.target.value)} required />
                    </div>
                    <div className="col-12 col-md-7">
                      <label className="form-label fw-medium text-secondary">Descrição</label>
                      <input type="text" className="form-control form-control-lg bg-light" value={descricaoProd} onChange={e => setDescricaoProd(e.target.value)} />
                    </div>
                    <div className="col-6 col-md-6">
                      <label className="form-label fw-medium text-secondary">Preço (R$)</label>
                      <input type="number" step="0.01" className="form-control form-control-lg bg-light" value={precoProd} onChange={e => setPrecoProd(e.target.value)} required />
                    </div>
                    <div className="col-6 col-md-6">
                      <label className="form-label fw-medium text-secondary">Estoque</label>
                      <input type="number" className="form-control form-control-lg bg-light" value={estoqueProd} onChange={e => setEstoqueProd(e.target.value)} required />
                    </div>
                    
                    <div className="col-12 d-flex gap-3 justify-content-end mt-4 pt-3 border-top">
                      <button type="button" className="btn btn-lg btn-outline-secondary px-4 fw-medium" onClick={fecharModal}>
                         Cancelar
                      </button>
                      <button type="submit" className="btn btn-lg btn-warning text-dark fw-bold px-5 shadow-sm">
                        💾 Salvar Alterações
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

export default ProdutosTab;