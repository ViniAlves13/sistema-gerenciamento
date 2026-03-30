import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';

const ClientesTab = ({ userRole }) => {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]); 
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidadeCompra, setQuantidadeCompra] = useState(1);
  const [carrinho, setCarrinho] = useState([]);

  const [showModal, setShowModal] = useState(false);
  
  // ESTADOS DO NOVO MODAL DE EXCLUSÃO
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [resClientes, resProdutos] = await Promise.all([
        axios.get('https://gestaopro-api-ovgf.onrender.com/api/clients', { headers }),
        axios.get('https://gestaopro-api-ovgf.onrender.com/api/products', { headers })
      ]);
      setClientes(resClientes.data);
      setProdutos(resProdutos.data);
    } catch (error) { console.error("Erro ao buscar dados", error); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleTelefoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); 
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    setTelefone(value.substring(0, 15));
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    setCep(value.substring(0, 9));
  };

  const buscarEnderecoPorCep = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        if (!response.data.erro) {
          setEndereco(`${response.data.logradouro}, Bairro ${response.data.bairro}, ${response.data.localidade} - ${response.data.uf}`);
        } else {
          toast.error("CEP não encontrado!");
        }
      } catch (error) { toast.error("Falha ao consultar CEP na base de dados."); }
    }
  };

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado) return toast.error('Selecione um produto.');
    if (quantidadeCompra <= 0) return toast.error('A quantidade deve ser maior que zero.');

    const produtoDb = produtos.find(p => p._id === produtoSelecionado);
    
    if (quantidadeCompra > produtoDb.stock) {
      return toast.error(`Estoque insuficiente! Temos apenas ${produtoDb.stock} unidades de ${produtoDb.name}.`);
    }

    const novoItem = {
      productId: produtoDb._id,
      productName: produtoDb.name,
      price: produtoDb.price,
      quantity: Number(quantidadeCompra),
      subtotal: produtoDb.price * Number(quantidadeCompra)
    };

    setCarrinho([...carrinho, novoItem]);
    setProdutoSelecionado(''); 
    setQuantidadeCompra(1);
    toast.success('Adicionado ao carrinho!');
  };

  const removerDoCarrinho = (indexParaRemover) => {
    setCarrinho(carrinho.filter((_, index) => index !== indexParaRemover));
  };

  const totalGasto = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        name: nome, 
        email, 
        phone: telefone, 
        cep,
        address: endereco,
        purchases: carrinho,
        totalSpent: totalGasto
      };

      if (editandoId) {
        await axios.put(`https://gestaopro-api-ovgf.onrender.com/api/clients/${editandoId}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        toast.success('Dados do cliente atualizados com sucesso!');
      } else {
        await axios.post('https://gestaopro-api-ovgf.onrender.com/api/clients', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        toast.success('Cliente e compra registrados com sucesso!');
      }
      
      fecharModal(); 
      fetchData();
    } catch (error) { toast.error('Erro ao salvar cliente. Verifique os dados.'); }
  };

  const handleEditClick = (cliente) => {
    setNome(cliente.name); setEmail(cliente.email);
    setTelefone(cliente.phone || ''); setCep(cliente.cep || ''); setEndereco(cliente.address || ''); 
    setCarrinho(cliente.purchases || []); 
    setEditandoId(cliente._id);
    setShowModal(true); 
  };

  const handleAddClick = () => {
    limparForm();
    setShowModal(true);
  };

  const limparForm = () => {
    setNome(''); setEmail(''); setTelefone(''); setCep(''); setEndereco(''); 
    setCarrinho([]); setEditandoId(null); 
  };

  const fecharModal = () => { 
    limparForm();
    setShowModal(false);
  };

  // ABRE O MODAL DE EXCLUSÃO
  const confirmDelete = (cliente) => {
    setClienteToDelete(cliente);
    setShowDeleteModal(true);
  };

  // EXECUTA A EXCLUSÃO
  const executeDelete = async () => {
    try {
      await axios.delete(`https://gestaopro-api-ovgf.onrender.com/api/clients/${clienteToDelete._id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Registro do cliente removido!');
      fetchData(); 
      setShowDeleteModal(false);
    } catch (error) { toast.error('Erro ao deletar cliente.'); }
  };

  const estoqueMaximoAtual = produtoSelecionado ? produtos.find(p => p._id === produtoSelecionado)?.stock : 1;

  const renderFormulario = () => (
    <>
      <h5 className="fw-bold text-secondary mb-4 mt-2 border-bottom pb-2">1. Dados Pessoais</h5>
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4">
          <label className="form-label fw-medium text-secondary">Nome Completo</label>
          <input type="text" className="form-control form-control-lg bg-light" value={nome} onChange={e => setNome(e.target.value)} required />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label fw-medium text-secondary">E-mail</label>
          <input type="email" className="form-control form-control-lg bg-light" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label fw-medium text-secondary">WhatsApp / Celular</label>
          <input type="text" className="form-control form-control-lg bg-light" value={telefone} onChange={handleTelefoneChange} placeholder="(00) 00000-0000" />
        </div>
        
        <div className="col-12 col-md-3">
          <label className="form-label fw-medium text-secondary">CEP</label>
          <input type="text" className="form-control form-control-lg bg-light border-primary" value={cep} onChange={handleCepChange} onBlur={buscarEnderecoPorCep} placeholder="00000-000" />
        </div>
        <div className="col-12 col-md-9">
          <label className="form-label fw-medium text-secondary">Endereço Completo</label>
          <input type="text" className="form-control form-control-lg bg-light" value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Preenchido automaticamente pelo CEP..." />
        </div>
      </div>

      <h5 className="fw-bold text-secondary mb-4 border-bottom pb-2">2. Registro de Compras (Opcional)</h5>
      <div className="row g-3 align-items-end p-4 rounded-4 bg-light border border-secondary-subtle mb-4 shadow-sm">
        <div className="col-12 col-md-6">
          <label className="form-label fw-bold text-dark">Selecione o Produto</label>
          <select className="form-select form-select-lg border-secondary" value={produtoSelecionado} onChange={e => setProdutoSelecionado(e.target.value)}>
            <option value="">-- Escolha um produto --</option>
            {produtos.map(p => (
              <option key={p._id} value={p._id} disabled={p.stock === 0}>
                {p.name} (R$ {p.price}) - Estoque: {p.stock} {p.stock === 0 && ' Esgotado!'}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-3">
          <label className="form-label fw-bold text-dark">Quantidade</label>
          <input type="number" min="1" max={estoqueMaximoAtual} className="form-control form-control-lg border-secondary text-center" value={quantidadeCompra} onChange={e => setQuantidadeCompra(e.target.value)} disabled={!produtoSelecionado} />
        </div>
        <div className="col-6 col-md-3">
          <button type="button" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm" onClick={adicionarAoCarrinho} disabled={!produtoSelecionado}>
            Adicionar
          </button>
        </div>
      </div>

      {carrinho.length > 0 && (
        <>
          <div className="table-responsive d-none d-md-block mb-4 rounded-3 border">
            <table className="table table-hover align-middle mb-0 bg-white">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 text-center">Qtd.</th>
                  <th className="py-3">Preço Un.</th>
                  <th className="py-3">Subtotal</th>
                  <th className="py-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody>
                {carrinho.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 fw-medium text-dark">{item.productName}</td>
                    <td className="text-center fs-5">{item.quantity}</td>
                    <td>R$ {item.price.toFixed(2)}</td>
                    <td className="fw-bold text-success fs-5">R$ {item.subtotal.toFixed(2)}</td>
                    <td className="text-center">
                      <button type="button" className="btn btn-outline-danger p-2 rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{width: '40px', height: '40px'}} onClick={() => removerDoCarrinho(index)} title="Remover item">
                      X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-success">
                <tr>
                  <td colSpan="3" className="text-end fw-bold py-3 fs-5">TOTAL DA COMPRA:</td>
                  <td colSpan="2" className="fw-bold fs-4 text-success py-3">R$ {totalGasto.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="d-block d-md-none mb-4">
            <h6 className="fw-bold text-secondary mb-3">Resumo do Carrinho:</h6>
            {carrinho.map((item, index) => (
              <div key={index} className="card border-secondary-subtle mb-3 shadow-sm rounded-4">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fw-bold text-dark fs-6">{item.productName}</span>
                    <button type="button" className="btn btn-outline-danger p-2 rounded-circle d-flex align-items-center justify-content-center" style={{width: '35px', height: '35px'}} onClick={() => removerDoCarrinho(index)} title="Remover item">
                    X
                    </button>
                  </div>
                  <div className="d-flex justify-content-between text-muted small mb-2 pb-2 border-bottom">
                    <span>Preço Un.: R$ {item.price.toFixed(2)}</span>
                    <span className="fw-bold text-dark">Qtd: {item.quantity}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-secondary small">Subtotal:</span>
                    <span className="fw-bold text-success fs-5">R$ {item.subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-success text-white rounded-4 p-3 shadow-sm d-flex justify-content-between align-items-center mt-2">
              <span className="fw-bold">TOTAL:</span>
              <span className="fw-bold fs-4">R$ {totalGasto.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="fade-in">
      
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 border-bottom border-secondary-subtle pb-3 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-2" style={{ color: '#1e2b3c' }}>Registro de Clientes e Vendas</h3>
          <span className="badge bg-success rounded-pill px-4 py-2 shadow-sm fs-6">
            {clientes.length} Registrados
          </span>
        </div>
        {(userRole === 'super_user' || userRole === 'adm') && (
          <button onClick={handleAddClick} className="btn btn-lg shadow text-white fw-bold px-4 btn-success">
          + Novo Cliente
          </button>
        )}
      </div>

      <div className="card bg-white border-0 shadow-sm rounded-4 overflow-hidden" style={{ borderTop: '5px solid #6c757d !important' }}>
        <div className="card-body p-0">
          
          {clientes.length === 0 ? (
            <div className="text-center py-5 text-muted fs-5">Nenhum cliente registrado.</div>
          ) : (
            <>
              {/* TABELA PC */}
              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-4 text-secondary border-bottom">Cliente</th>
                      <th className="px-4 py-4 text-secondary border-bottom">Contato</th>
                      <th className="px-4 py-4 text-secondary border-bottom">Total Gasto</th>
                      {(userRole === 'super_user' || userRole === 'adm') && <th className="px-4 py-4 text-secondary border-bottom text-center">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {clientes.map(cliente => (
                      <tr key={cliente._id}>
                        <td className="px-4 py-3">
                          <span className="fw-bold fs-6" style={{ color: '#2b3a4a' }}>{cliente.name}</span><br/>
                          <span className="text-muted">{cliente.email}</span>
                          
                          {cliente.purchases && cliente.purchases.length > 0 && (
                            <div className="mt-2 p-2 bg-light rounded border border-secondary-subtle">
                              <span className="fw-bold text-secondary small d-block mb-1">Última Compra:</span>
                              <ul className="list-unstyled mb-0 small text-dark">
                                {cliente.purchases.map((p, idx) => (
                                  <li key={idx}>• {p.quantity}x {p.productName} <span className="text-success fw-medium">(R$ {Number(p.price).toFixed(2)})</span></li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted">{cliente.phone || '-'}</td>
                        <td className="px-4 py-3">
                          {cliente.totalSpent > 0 ? (
                            <span className="badge bg-success shadow-sm fs-6 px-3 py-2">R$ {cliente.totalSpent.toFixed(2)}</span>
                          ) : (
                            <span className="text-muted fst-italic">Nenhuma compra</span>
                          )}
                        </td>
                        {(userRole === 'super_user' || userRole === 'adm') && (
                          <td className="px-4 py-3">
                            <div className="d-flex flex-column gap-2 mx-auto" style={{ maxWidth: '110px' }}>
                              <button onClick={() => handleEditClick(cliente)} className="btn btn-outline-primary py-1 w-100 fw-medium shadow-sm rounded-3">
                              Editar
                              </button>
                              <button onClick={() => handleDelete(cliente._id)} className="btn btn-outline-danger py-1 w-100 fw-medium shadow-sm rounded-3">
                              Excluir
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
                {clientes.map(cliente => (
                  <div key={cliente._id} className="card shadow-sm border-0 mb-4 rounded-4">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold fs-5" style={{ color: '#2b3a4a' }}>{cliente.name}</span>
                      </div>
                      <div className="mb-2 text-muted small border-bottom pb-2">{cliente.email}</div>
                      
                      <div className="mb-2 mt-3">
                        <span className="text-secondary fw-bold small">Contato: </span>
                        <span className="text-dark small">{cliente.phone || '-'}</span>
                      </div>
                      
                      {cliente.purchases && cliente.purchases.length > 0 && (
                        <div className="mt-3 p-3 bg-white rounded-3 border">
                          <span className="text-secondary fw-bold small d-block mb-2">Resumo da Compra:</span>
                          <ul className="list-unstyled mb-0 small">
                            {cliente.purchases.map((p, idx) => (
                              <li key={idx} className="mb-1 border-bottom pb-1">
                                <span className="fw-bold">{p.quantity}x</span> {p.productName} <br/>
                                <span className="text-success fw-medium">R$ {Number(p.price).toFixed(2)} un.</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center mb-4 mt-3 bg-light p-3 rounded-3 border">
                        <span className="text-secondary fw-bold">Total Gasto: </span>
                        {cliente.totalSpent > 0 ? (
                          <span className="badge bg-success shadow-sm fs-6 px-3 py-2">R$ {cliente.totalSpent.toFixed(2)}</span>
                        ) : (
                          <span className="text-muted fst-italic">Nenhuma compra</span>
                        )}
                      </div>
                      
                      {(userRole === 'super_user' || userRole === 'adm') && (
                        <div className="d-flex flex-column gap-2 border-top pt-4 mt-2">
                          <button onClick={() => handleEditClick(cliente)} className="btn btn-outline-primary py-2 w-100 fw-bold shadow-sm rounded-3">
                          Editar
                          </button>
                          <button onClick={() => handleDelete(cliente._id)} className="btn btn-outline-danger py-2 w-100 fw-bold shadow-sm rounded-3">
                          Excluir
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

      {/* MODAL DE CADASTRO E EDIÇÃO */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
              <div className="modal-content rounded-4 border-0 shadow-lg" style={{ maxHeight: '90vh' }}>
                <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                  <h4 className={`modal-title fw-bold ${editandoId ? 'text-warning text-dark' : 'text-success'}`}>
                    {editandoId ? 'Editar Cliente e Compras' : 'Novo Cliente e Compra'}
                  </h4>
                  <button type="button" className="btn-close shadow-none" onClick={fecharModal}></button>
                </div>
                <div className="modal-body p-4 pt-2">
                  <form onSubmit={handleSubmit}>
                    {renderFormulario()}
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4 pt-3 border-top w-100">
                      <button type="button" className="btn btn-lg btn-outline-secondary px-4 fw-medium order-2 order-md-1" onClick={fecharModal}>
                        Cancelar
                      </button>
                      <button type="submit" className={`btn btn-lg fw-bold px-5 shadow-sm order-1 order-md-2 ${editandoId ? 'btn-warning text-dark' : 'btn-success text-white'}`}>
                        {editandoId ? 'Salvar Alterações' : 'Salvar Novo Cliente'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* NOVO MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
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
                  <p className="mb-0 fs-5 text-dark">Tem certeza que deseja apagar o registro de <strong>{clienteToDelete?.name}</strong>?</p>
                  <p className="text-muted small mt-2">Esta ação apagará o histórico de compras deste cliente e não poderá ser desfeita.</p>
                </div>
                <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                  <button type="button" className="btn btn-light fw-medium px-4" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                  <button type="button" className="btn btn-danger fw-bold px-4" onClick={executeDelete}>Sim, Excluir</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default ClientesTab;