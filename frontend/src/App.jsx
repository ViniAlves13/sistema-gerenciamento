import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Auth from './pages/auth';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      {/* O Toaster deve ficar aqui em cima para funcionar em todas as páginas */}
      <Toaster position="top-right" reverseOrder={false} />
      
      <Routes>
        <Route path="/" element={<Auth />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;