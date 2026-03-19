import { useState, useEffect } from 'react';
import axios from 'axios';

const ClientesTab = ({ userRole }) => {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]); // Guarda os produtos do banco
  
  // Estados do formulário de Cliente
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  // Estados do Carrinho de Compras
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidadeCompra, setQuantidadeCompra] = useState(1);
  const [carrinho, setCarrinho] = useState([]);

  // Busca Clientes e Produtos ao carregar a página
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

  // ==========================================
  // REGRAS DE NEGÓCIO: MÁSCARAS E APIs
  // ==========================================
  
  // Máscara de Telefone: (99) 99999-9999
  const handleTelefoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Tira tudo que não é número
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    setTelefone(value.substring(0, 15));
  };

  // Máscara de CEP e Busca de Endereço via API
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
          // Preenche o endereço sozinho!
          setEndereco(`${response.data.logradouro}, Bairro ${response.data.bairro}, ${response.data.localidade} - ${response.data.uf}`);
        } else {
          alert("CEP não encontrado!");
        }
      } catch (error) { console.error("Erro na API ViaCEP"); }
    }
  };

  // ==========================================
  // REGRAS DE NEGÓCIO: CARRINHO DE COMPRAS
  // ==========================================

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado) return alert('Selecione um produto.');
    if (quantidadeCompra <= 0) return alert('A quantidade deve ser maior que zero.');

    const produtoDb = produtos.find(p => p._id === produtoSelecionado);
    
    // Regra: Não pode comprar mais do que tem no estoque!
    if (quantidadeCompra > produtoDb.stock) {
      return alert(`Estoque insuficiente! Temos apenas ${produtoDb.stock} unidades de ${produtoDb.name}.`);
    }

    const novoItem = {
      productId: produtoDb._id,
      productName: produtoDb.name,
      price: produtoDb.price,
      quantity: Number(quantidadeCompra),
      subtotal: produtoDb.price * Number(quantidadeCompra)
    };

    setCarrinho([...carrinho, novoItem]);
    setProdutoSelecionado(''); // Reseta o select
    setQuantidadeCompra(1);
  };

  const removerDoCarrinho = (indexParaRemover) => {
    setCarrinho(carrinho.filter((_, index) => index !== indexParaRemover));
  };

  // Calcula o total da compra na hora
  const totalGasto = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  // ==========================================
  // SALVAR NO BANCO
  // ==========================================

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
        // Se estiver editando
        await axios.put(`https://gestaopro-api-ovgf.onrender.com/api/clients/${editandoId}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      } else {
        await axios.post('https://gestaopro-api-ovgf.onrender.com/api/clients', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      }
      
      limparForm(); fetchData();
      alert('Cliente e compra registrados com sucesso!');
    } catch (error) { alert('Erro ao salvar cliente.'); }
  };

  const handleEditClick = (cliente) => {
    setNome(cliente.name); setEmail(cliente.email);
    setTelefone(cliente.phone || ''); setCep(cliente.cep || ''); setEndereco(cliente.address || ''); 
    setCarrinho(cliente.purchases || []); // Carrega as compras antigas se for editar
    setEditandoId(cliente._id);
  };

  const limparForm = () => { 
    setNome(''); setEmail(''); setTelefone(''); setCep(''); setEndereco(''); 
    setCarrinho([]); setEditandoId(null); 
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este cliente da base de dados?')) return;
    try {
      await axios.delete(`https://gestaopro-api-ovgf.onrender.com/api/clients/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchData(); 
    } catch (error) { alert('Erro ao deletar.'); }
  };

  // Para achar qual o estoque máximo do produto selecionado no dropdown
  const estoqueMaximoAtual = produtoSelecionado ? produtos.find(p => p._id === produtoSelecionado)?.stock : 1;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary-subtle pb-2">
        <h3 className="fw-bold text-dark mb-0" style={{ color: '#1e2b3c' }}>👥 Carteira de Clientes e Vendas</h3>
        <span className="badge bg-success rounded-pill px-3 py-2 shadow-sm">
          {clientes.length} Registrados
        </span>
      </div>

      {(userRole === 'super_user' || userRole === 'adm') && (
        <div className="card bg-white border-0 shadow-sm mb-4 rounded-3" style={{ borderTop: '4px solid #198754 !important' }}>
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h5 className="card-title text-success fw-bold mb-0">
              {editandoId ? '✏️ Editar Cliente e Adicionar Compras' : '➕ Novo Cliente e Registro de Compra'}
            </h5>
          </div>
          <div className="card-body p-4">
            
            <form onSubmit={handleSubmit}>
              
              {/* SESSÃO 1: DADOS DO CLIENTE */}
              <h6 className="fw-bold text-secondary mb-3 mt-2 border-bottom pb-2">1. Dados Pessoais</h6>
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                  <label className="form-label fw-medium text-secondary">Nome Completo</label>
                  <input type="text" className="form-control bg-light" value={nome} onChange={e => setNome(e.target.value)} required />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-medium text-secondary">E-mail</label>
                  <input type="email" className="form-control bg-light" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-medium text-secondary">WhatsApp / Celular</label>
                  <input type="text" className="form-control bg-light" value={telefone} onChange={handleTelefoneChange} placeholder="(00) 00000-0000" />
                </div>
                
                <div className="col-12 col-md-2">
                  <label className="form-label fw-medium text-secondary">CEP</label>
                  <input type="text" className="form-control bg-light border-primary" value={cep} onChange={handleCepChange} onBlur={buscarEnderecoPorCep} placeholder="00000-000" />
                </div>
                <div className="col-12 col-md-10">
                  <label className="form-label fw-medium text-secondary">Endereço Completo</label>
                  <input type="text" className="form-control bg-light" value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Preenchido automaticamente ao digitar o CEP..." />
                </div>
              </div>

              {/* SESSÃO 2: CARRINHO DE COMPRAS */}
              <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2">2. Registro de Compras (Opcional)</h6>
              <div className="row g-3 align-items-end p-3 rounded bg-light border border-secondary-subtle mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark">Selecione o Produto</label>
                  <select className="form-select border-secondary" value={produtoSelecionado} onChange={e => setProdutoSelecionado(e.target.value)}>
                    <option value="">-- Escolha um produto --</option>
                    {produtos.map(p => (
                      <option key={p._id} value={p._id} disabled={p.stock === 0}>
                        {p.name} (R$ {p.price}) - Estoque: {p.stock} {p.stock === 0 && '❌ Esgotado'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label fw-medium text-dark">Quantidade</label>
                  <input type="number" min="1" max={estoqueMaximoAtual} className="form-control border-secondary" value={quantidadeCompra} onChange={e => setQuantidadeCompra(e.target.value)} disabled={!produtoSelecionado} />
                </div>
                <div className="col-6 col-md-3">
                  <button type="button" className="btn btn-primary w-100 fw-bold shadow-sm" onClick={adicionarAoCarrinho} disabled={!produtoSelecionado}>
                    ➕ Adicionar
                  </button>
                </div>
              </div>

              {/* LISTA DE PRODUTOS ADICIONADOS */}
              {carrinho.length > 0 && (
                <div className="table-responsive mb-3">
                  <table className="table table-sm table-bordered mb-0 bg-white">
                    <thead className="table-light">
                      <tr>
                        <th>Produto</th>
                        <th className="text-center">Qtd.</th>
                        <th>Preço Un.</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrinho.map((item, index) => (
                        <tr key={index}>
                          <td className="fw-medium text-dark">{item.productName}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td>R$ {item.price.toFixed(2)}</td>
                          <td className="fw-bold text-success">R$ {item.subtotal.toFixed(2)}</td>
                          <td className="text-center">
                            <button type="button" className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => removerDoCarrinho(index)}>X</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-success">
                      <tr>
                        <td colSpan="3" className="text-end fw-bold">TOTAL DA COMPRA:</td>
                        <td colSpan="2" className="fw-bold fs-5 text-success">R$ {totalGasto.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* BOTÕES DE SALVAR */}
              <div className="col-12 d-flex gap-2 justify-content-md-end mt-4 pt-3 border-top">
                {editandoId && (
                  <button type="button" className="btn btn-outline-secondary shadow-sm" onClick={limparForm}>Cancelar Edição</button>
                )}
                <button type="submit" className={`btn shadow-sm fw-bold px-4 ${editandoId ? 'btn-warning text-dark' : 'btn-success'}`}>
                  {editandoId ? 'Atualizar Registro' : 'Salvar Cliente e Compras'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* TABELA GERAL DE CLIENTES */}
      <div className="card bg-white border-0 shadow-sm rounded-3 overflow-hidden" style={{ borderTop: '4px solid #6c757d !important' }}>
        <div className="card-body p-0">
          
          {clientes.length === 0 ? (
            <div className="text-center py-5 text-muted">Nenhum cliente registrado.</div>
          ) : (
            <>
              {/* --- VERSÃO 1: TABELA (Para PC e Tablets: d-none esconde no mobile, d-md-block mostra no PC) --- */}
              <div className="table-responsive d-none d-md-block">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-3 text-secondary border-bottom">Cliente</th>
                      <th className="px-4 py-3 text-secondary border-bottom">Contato</th>
                      <th className="px-4 py-3 text-secondary border-bottom">Total Gasto na Loja</th>
                      {(userRole === 'super_user' || userRole === 'adm') && <th className="px-4 py-3 text-secondary border-bottom text-end">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {clientes.map(cliente => (
                      <tr key={cliente._id}>
                        <td className="px-4">
                          <span className="fw-bold" style={{ color: '#2b3a4a' }}>{cliente.name}</span><br/>
                          <small className="text-muted">{cliente.email}</small>
                        </td>
                        <td className="px-4 text-muted">{cliente.phone || '-'}</td>
                        <td className="px-4">
                          {cliente.totalSpent > 0 ? (
                            <span className="badge bg-success shadow-sm fs-6">R$ {cliente.totalSpent.toFixed(2)}</span>
                          ) : (
                            <span className="text-muted fst-italic">Nenhuma compra</span>
                          )}
                        </td>
                        {(userRole === 'super_user' || userRole === 'adm') && (
                          <td className="px-4 text-end">
                            <button onClick={() => handleEditClick(cliente)} className="btn btn-sm btn-outline-success me-1 fw-medium shadow-sm">Ver/Editar Compras</button>
                            <button onClick={() => handleDelete(cliente._id)} className="btn btn-sm btn-outline-danger fw-medium shadow-sm">Excluir</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* --- VERSÃO 2: CARTÕES (Para Celular: d-block mostra no mobile, d-md-none esconde no PC) --- */}
              <div className="d-block d-md-none p-3 bg-light">
                {clientes.map(cliente => (
                  <div key={cliente._id} className="card shadow-sm border-0 mb-3">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold fs-5" style={{ color: '#2b3a4a' }}>{cliente.name}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-secondary fw-bold small">E-mail: </span>
                        <span className="text-muted small">{cliente.email}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-secondary fw-bold small">Contato: </span>
                        <span className="text-muted small">{cliente.phone || '-'}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3 mt-3 bg-white p-2 rounded border">
                        <span className="text-secondary fw-bold small">Total Gasto: </span>
                        {cliente.totalSpent > 0 ? (
                          <span className="badge bg-success shadow-sm fs-6">R$ {cliente.totalSpent.toFixed(2)}</span>
                        ) : (
                          <span className="text-muted fst-italic small">Nenhuma compra</span>
                        )}
                      </div>
                      
                      {(userRole === 'super_user' || userRole === 'adm') && (
                        <div className="d-flex gap-2 border-top pt-3 mt-2">
                          <button onClick={() => handleEditClick(cliente)} className="btn btn-sm btn-outline-success w-50 fw-medium shadow-sm">Editar</button>
                          <button onClick={() => handleDelete(cliente._id)} className="btn btn-sm btn-outline-danger w-50 fw-medium shadow-sm">Excluir</button>
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

export default ClientesTab;