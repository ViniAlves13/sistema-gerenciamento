import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://gestaopro-api-ovgf.onrender.com/api/auth/login', {
        email,
        password
      });
      
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center w-100 mt-5 px-3">
      <form onSubmit={handleLogin} className="d-flex flex-column gap-3 w-100" style={{ maxWidth: '350px' }}>
        <h2 className="text-center fw-bold">Login do Sistema</h2>
        {error && <p className="text-danger fw-medium text-center">{error}</p>}
        
        <input 
          className="form-control"
          type="email" 
          placeholder="E-mail" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: '12px' }}
        />
        
        <input 
          className="form-control"
          type="password" 
          placeholder="Senha" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: '12px' }}
        />
        
        <button type="submit" className="btn btn-primary fw-bold" style={{ padding: '12px', cursor: 'pointer' }}>Entrar</button>
      </form>
    </div>
  );
};

export default Login;