import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Rescisao from './pages/Rescisao'
import SalarioLiquido from './pages/SalarioLiquido'
import Tabelas from './pages/Tabelas'
import Ferias from './pages/Ferias'
import DecimoTerceiro from './pages/DecimoTerceiro'
import HorasExtras from './pages/HorasExtras'
import SeguroDesemprego from './pages/SeguroDesemprego'
import Sobre from './pages/Sobre'
import Privacidade from './pages/Privacidade'
import Termos from './pages/Termos'
import Placeholder from './pages/Placeholder'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="rescisao" element={<Rescisao />} />
          <Route path="salario-liquido" element={<SalarioLiquido />} />
          <Route path="tabelas" element={<Tabelas />} />
          <Route path="ferias" element={<Ferias />} />
          <Route path="decimo-terceiro" element={<DecimoTerceiro />} />
          <Route path="horas-extras" element={<HorasExtras />} />
          <Route path="seguro-desemprego" element={<SeguroDesemprego />} />
          <Route path="sobre" element={<Sobre />} />
          <Route path="privacidade" element={<Privacidade />} />
          <Route path="termos" element={<Termos />} />
          <Route path="premium" element={<Placeholder title="Plano Premium" emoji="⭐" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
