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
import EditarRestaurante from "./pages/EditarRestaurante";
import CrearPublicacion from "./pages/CrearPublicacion";
import EditarPublicacion from "./pages/EditarPublicacion";
import BotonCrearPublicacion from "./components/BotonCrearPublicacion";
import ConfiguracionUsuario from "./pages/ConfiguracionUsuario";



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/restaurantes/:id" element={<RestauranteDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/crear-restaurante" element={<CrearRestaurante />} />
          <Route path="/perfil" element={<PerfilUsuario />} />
          <Route path="/usuarios/:id" element={<PerfilPublicoUsuario />} />
          <Route path="/restaurantes/:id/editar" element={<EditarRestaurante />} />
          <Route path="/crear-publicacion" element={<CrearPublicacion />} />
          <Route path="/publicaciones/:id/editar" element={<EditarPublicacion />} />
          <Route path="/configuracion" element={<ConfiguracionUsuario />} />

        </Routes>

      {/* Botón flotante visible en toda la app */}
        
        <BotonCrearPublicacion />
        
        <ToastContainer 
          position="bottom-left"
          autoClose={2000}
          theme="colored"
        />
      </>
    </BrowserRouter>
  </React.StrictMode>
);
