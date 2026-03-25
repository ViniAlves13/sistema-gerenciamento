import { useState, useEffect } from 'react';
import axios from 'axios';

const ResumoTab = () => {
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const [resProdutos, resClientes] = await Promise.all([
          axios.get('https://gestaopro-api-ovgf.onrender.com/api/products', { headers }),
          axios.get('https://gestaopro-api-ovgf.onrender.com/api/clients', { headers })
        ]);
        setProdutos(resProdutos.data);
        setClientes(resClientes.data);
      } catch (error) {
        console.error("Erro ao buscar dados do resumo", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 py-5">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status"></div>
      </div>
    );
  }

  // ==========================================
  // LÓGICA DE NEGÓCIO (Cálculo dos Indicadores)
  // ==========================================
  const totalClientes = clientes.length;
  const totalProdutos = produtos.length;
  
  // Calcula o valor total parado em estoque (Preço x Quantidade)
  const valorEmEstoque = produtos.reduce((acc, p) => acc + (p.price * p.stock), 0);
  
  // Calcula o faturamento total (Soma de tudo que os clientes gastaram)
  const faturamentoTotal = clientes.reduce((acc, c) => acc + (c.totalSpent || 0), 0);

  // Alertas de Estoque (Produtos com 5 ou menos unidades)
  const produtosAlerta = produtos.filter(p => p.stock > 0 && p.stock <= 5);
  const produtosEsgotados = produtos.filter(p => p.stock === 0);

  return (
    <div className="fade-in">
      <div className="mb-4 border-bottom border-secondary-subtle pb-3">
        <h3 className="fw-bold text-dark mb-1" style={{ color: '#1e2b3c' }}>Visão Geral do Sistema</h3>
        <p className="text-muted mb-0">Resumo financeiro e operacional do seu negócio.</p>
      </div>

      {/* CARDS DE INDICADORES (KPIs) */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100" style={{ borderBottom: '5px solid #0d6efd !important' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary fw-bold">Total de Clientes</span>
                <span className="fs-3"></span>
              </div>
              <h2 className="fw-bold text-dark mb-0">{totalClientes}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100" style={{ borderBottom: '5px solid #6c757d !important' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary fw-bold">Produtos Cadastrados</span>
                <span className="fs-3"></span>
              </div>
              <h2 className="fw-bold text-dark mb-0">{totalProdutos}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100" style={{ borderBottom: '5px solid #198754 !important' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary fw-bold">Faturamento Total</span>
                <span className="fs-3"></span>
              </div>
              <h2 className="fw-bold text-success mb-0">R$ {faturamentoTotal.toFixed(2)}</h2>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100" style={{ borderBottom: '5px solid #0dcaf0 !important' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary fw-bold">Valor em Estoque</span>
                <span className="fs-3"></span>
              </div>
              <h2 className="fw-bold text-info mb-0">R$ {valorEmEstoque.toFixed(2)}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA DE ALERTAS */}
      <div className="row g-4">
        {/* Painel de Estoque Baixo */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold text-warning mb-0">Alertas de Estoque</h5>
            </div>
            <div className="card-body p-4">
              {produtosEsgotados.length === 0 && produtosAlerta.length === 0 ? (
                <div className="text-center text-muted py-4">Estoque sob controle. Nenhum alerta.</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {produtosEsgotados.map(p => (
                    <li key={p._id} className="list-group-item px-0 d-flex justify-content-between align-items-center border-0 mb-2">
                      <div>
                        <span className="fw-bold text-dark d-block">{p.name}</span>
                        <small className="text-danger fw-medium">Esgotado!</small>
                      </div>
                      <span className="badge bg-danger rounded-pill px-3 py-2">0</span>
                    </li>
                  ))}
                  {produtosAlerta.map(p => (
                    <li key={p._id} className="list-group-item px-0 d-flex justify-content-between align-items-center border-0 mb-2">
                      <div>
                        <span className="fw-bold text-dark d-block">{p.name}</span>
                        <small className="text-warning text-dark fw-medium">Baixa quantidade</small>
                      </div>
                      <span className="badge bg-warning text-dark rounded-pill px-3 py-2">{p.stock} un.</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Painel de Clientes Recentes */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold text-primary mb-0">Últimos Clientes Registrados</h5>
            </div>
            <div className="card-body p-4">
              {clientes.length === 0 ? (
                <div className="text-center text-muted py-4">Nenhum cliente cadastrado ainda.</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {/* Pega apenas os 4 últimos clientes da lista */}
                  {clientes.slice(-4).reverse().map(c => (
                    <li key={c._id} className="list-group-item px-0 d-flex justify-content-between align-items-center border-0 mb-2">
                      <div>
                        <span className="fw-bold text-dark d-block">{c.name}</span>
                        <small className="text-muted">{c.email}</small>
                      </div>
                      {c.totalSpent > 0 ? (
                        <span className="badge bg-success shadow-sm px-3 py-2">R$ {c.totalSpent.toFixed(2)}</span>
                      ) : (
                        <span className="badge bg-light text-secondary border px-3 py-2">Sem compras</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ResumoTab;