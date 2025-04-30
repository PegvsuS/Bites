import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from "./App";
import RestauranteDetalle from "./RestauranteDetalle";
import Login from "./Login";
import Register from "./Register";
import CrearRestaurante from './CrearRestaurante';

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
