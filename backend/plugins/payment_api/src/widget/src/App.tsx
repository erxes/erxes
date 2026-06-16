import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import InvoiceDetail from './pages/InvoiceDetail';

function App() {

  return (
    <Router>
  <Routes>
    <Route path="/pl:payment/widget/invoice/:id" element={<InvoiceDetail />} />
  </Routes>
</Router>
  );
}

export default App;
