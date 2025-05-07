import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from "./App";
import RestauranteDetalle from "./pages/RestauranteDetalle";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CrearRestaurante from './pages/CrearRestaurante';
import PerfilUsuario from "./pages/PerfilUsuario";
import PerfilPublicoUsuario from "./pages/PerfilPublicoUsuario";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/restaurante/:id" element={<RestauranteDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/crear-restaurante" element={<CrearRestaurante />} />
          <Route path="/" element={<App />} />
            <Route path="/perfil" element={<PerfilUsuario />} />
          <Route path="/usuarios/:id" element={<PerfilPublicoUsuario />} />
        </Routes>
        <ToastContainer 
          position="bottom-left"
          autoClose={2000}
          theme="colored"
        />
      </>
    </BrowserRouter>
  </React.StrictMode>
);
