import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from './components/Layout';
import Home from './components/Home';
import Ai from './components/Ai';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='ai' element={<Ai />} />
        </Route>
      </Routes>
    </BrowserRouter >
  );
}

export default App;