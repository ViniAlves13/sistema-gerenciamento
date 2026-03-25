import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(''); 

    try {
      if (isLogin) {
        const response = await axios.post('https://gestaopro-api-ovgf.onrender.com/api/users/login', {
          email,
          password: senha
        });
        
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      } else {
        await axios.post('https://gestaopro-api-ovgf.onrender.com/api/users/register', {
          name: nome,
          email,
          password: senha,
          role: 'usuario_comum' 
        });
        
        alert('Conta criada com sucesso! Faça o login.');
        setIsLogin(true); 
        setSenha(''); 
      }
    } catch (error) {
      setErro(error.response?.data?.error || 'Ocorreu um erro. Tente novamente.');
    }
  };

  // === O SEGREDO DO BACKGROUND ESTÁ AQUI ===
  // Usamos um linear-gradient escuro por cima da imagem para dar contraste
  const backgroundStyle = {
    backgroundImage: `linear-gradient(rgba(34, 40, 49, 0.75), rgba(34, 40, 49, 0.75)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    width: '100%'
  };

  return (
    // Trocamos o "bg-light" pelo nosso estilo de imagem
    <div style={backgroundStyle} className="d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            
            {/* Adicionei um leve arredondamento extra (rounded-4) e uma sombra maior (shadow) para o card flutuar na imagem */}
            <div className="card shadow border-0 rounded-4 mt-5 overflow-hidden">
              <div className="card-header bg-dark text-white text-center py-4 border-0">
                <h3 className="fw-bold my-2">
                  {isLogin ? 'Acesso Restrito' : 'Nova Conta'}
                </h3>
                <p className="mb-0 text-white-50" style={{ fontSize: '14px' }}>
                  {isLogin ? 'Sistema de Gerenciamento Integrado' : 'Preencha os dados para solicitar acesso'}
                </p>
              </div>
              
              <div className="card-body p-5">
                {erro && (
                  <div className="alert alert-danger" role="alert">
                    {erro}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="form-floating mb-3">
                      <input 
                        type="text" 
                        className="form-control" 
                        id="inputNome" 
                        placeholder="João Silva"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                      />
                      <label htmlFor="inputNome">Nome Completo</label>
                    </div>
                  )}

                  <div className="form-floating mb-3">
                    <input 
                      type="email" 
                      className="form-control" 
                      id="inputEmail" 
                      placeholder="nome@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label htmlFor="inputEmail">Endereço de E-mail</label>
                  </div>

                  <div className="form-floating mb-4">
                    <input 
                      type="password" 
                      className="form-control" 
                      id="inputSenha" 
                      placeholder="Senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                    <label htmlFor="inputSenha">Senha</label>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary btn-lg fw-bold">
                      {isLogin ? 'Entrar no Sistema' : 'Finalizar Cadastro'}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="card-footer text-center py-3 bg-light border-0">
                <div className="small">
                  {isLogin ? (
                    <span className="text-muted">
                      Ainda não tem acesso?{' '}
                      <button 
                        className="btn btn-link p-0 text-decoration-none fw-bold" 
                        onClick={() => { setIsLogin(false); setErro(''); }}
                      >
                        Cadastre-se aqui
                      </button>
                    </span>
                  ) : (
                    <span className="text-muted">
                      Já possui uma conta?{' '}
                      <button 
                        className="btn btn-link p-0 text-decoration-none fw-bold" 
                        onClick={() => { setIsLogin(true); setErro(''); }}
                      >
                        Faça Login
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;