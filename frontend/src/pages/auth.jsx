import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); 

    try {
      if (isLogin) {
        const response = await axios.post('https://gestaopro-api-ovgf.onrender.com/api/users/login', {
          email,
          password: senha
        });
        
        localStorage.setItem('token', response.data.token);
        toast.success('Acesso liberado!'); 
        navigate('/dashboard');
      } else {
        await axios.post('https://gestaopro-api-ovgf.onrender.com/api/users/register', {
          name: nome,
          email,
          password: senha,
          role: 'usuario_comum' 
        });
        
        // AQUI ESTÁ O SEU TOAST DE CADASTRO REALIZADO
        toast.success('Cadastro realizado com sucesso! Faça o login.');
        setIsLogin(true); 
        setSenha(''); 
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false); 
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const backgroundStyle = {
    backgroundImage: `linear-gradient(rgba(34, 40, 49, 0.75), rgba(34, 40, 49, 0.75)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    width: '100%'
  };

  return (
    <div style={backgroundStyle} className="d-flex align-items-center justify-content-center px-3 px-md-0">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5">
            
            <div className="card shadow border-0 rounded-4 mt-4 overflow-hidden">
              <div className="card-header bg-dark text-white text-center py-4 border-0">
                <h3 className="fw-bold my-2 text-truncate">
                  {isLogin ? 'Acesso Restrito' : 'Nova Conta'}
                </h3>
                <p className="mb-0 text-white-50 small">
                  {isLogin ? 'Sistema de Gerenciamento Integrado' : 'Preencha os dados para solicitar acesso'}
                </p>
              </div>
              
              <div className="card-body p-4 p-md-5">
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
                        disabled={isLoading}
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
                      disabled={isLoading}
                    />
                    <label htmlFor="inputEmail">Endereço de E-mail</label>
                  </div>

                  <div className="position-relative mb-4">
                    <div className="form-floating">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="form-control" 
                        id="inputSenha" 
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ paddingRight: '50px' }} 
                      />
                      <label htmlFor="inputSenha">Senha</label>
                    </div>
                    
                    <button 
                      type="button" 
                      className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-decoration-none text-secondary"
                      onClick={togglePasswordVisibility}
                      disabled={isLoading}
                      style={{ zIndex: 5, padding: '0 15px' }}
                      title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className={`btn btn-lg fw-bold text-truncate d-flex justify-content-center align-items-center ${isLoading ? 'btn-secondary' : 'btn-primary'}`} 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Aguarde...
                        </>
                      ) : (
                        isLogin ? 'Entrar no Sistema' : 'Finalizar Cadastro'
                      )}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="card-footer text-center py-3 bg-light border-0">
                <div className="small">
                  {isLogin ? (
                    <span className="text-muted d-block d-sm-inline">
                      Ainda não tem acesso?{' '}
                      <button 
                        className="btn btn-link p-0 text-decoration-none fw-bold ms-1" 
                        onClick={() => { setIsLogin(false); setSenha(''); setShowPassword(false); }}
                        disabled={isLoading}
                      >
                        Cadastre-se aqui
                      </button>
                    </span>
                  ) : (
                    <span className="text-muted d-block d-sm-inline">
                      Já possui uma conta?{' '}
                      <button 
                        className="btn btn-link p-0 text-decoration-none fw-bold ms-1" 
                        onClick={() => { setIsLogin(true); setSenha(''); setShowPassword(false); }}
                        disabled={isLoading}
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