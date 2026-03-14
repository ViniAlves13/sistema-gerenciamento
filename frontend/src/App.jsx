import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './pages/auth';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial de Login/Cadastro */}
        <Route path="/" element={<Auth />} /> 
        
        {/* Rota do Dashboard livre para teste */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;