import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import BuscadorUsuarios from "./components/BuscadorUsuarios";

Modal.setAppElement("#root");

function App() {
  const [restaurantes, setRestaurantes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ordenSeleccionado, setOrdenSeleccionado] = useState("");
  const [mostrarOrdenDropdown, setMostrarOrdenDropdown] = useState(false);
  const [filtros, setFiltros] = useState({
    localidad: "",
    tipo_cocina: "",
    precioMin: "",
    precioMax: "",
    valoracionMin: ""
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const isAuthenticated = localStorage.getItem("token") !== null;

  const fetchRestaurantes = (params = "") => {
    fetch(`${API_URL}/api/restaurantes/${params}`)
      .then(res => res.json())
      .then(data => setRestaurantes(data))
      .catch(err => console.error("Error al cargar restaurantes", err));
  };

  useEffect(() => {
    fetchRestaurantes();
  }, []);

  useEffect(() => {
    const query = [];

    if (filtros.localidad) query.push(`localidad=${filtros.localidad}`);
    if (filtros.tipo_cocina) query.push(`tipo_cocina=${filtros.tipo_cocina}`);
    if (filtros.precioMin) query.push(`precio_min=${filtros.precioMin}`);
    if (filtros.precioMax) query.push(`precio_max=${filtros.precioMax}`);
    if (filtros.valoracionMin) query.push(`valoracion_min=${filtros.valoracionMin}`);
    if (ordenSeleccionado) query.push(`ordenar_por=${ordenSeleccionado}`);

    const params = query.length ? "?" + query.join("&") : "";
    fetchRestaurantes(params);
  }, [ordenSeleccionado]);

  const aplicarFiltros = () => {
    const query = [];

    if (filtros.localidad) query.push(`localidad=${filtros.localidad}`);
    if (filtros.tipo_cocina) query.push(`tipo_cocina=${filtros.tipo_cocina}`);
    if (filtros.precioMin) query.push(`precio_min=${filtros.precioMin}`);
    if (filtros.precioMax) query.push(`precio_max=${filtros.precioMax}`);
    if (filtros.valoracionMin) query.push(`valoracion_min=${filtros.valoracionMin}`);
    if (ordenSeleccionado) query.push(`ordenar_por=${ordenSeleccionado}`);

    const params = query.length ? "?" + query.join("&") : "";
    fetchRestaurantes(params);
    setIsModalOpen(false);
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  return (
    <>
      <ToastContainer />
      <div style={{ padding: "2rem" }}>
        <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {!isAuthenticated ? (
              <>
                <a href="/login" style={{ marginRight: "1rem" }}>Login</a>
                <a href="/register">Registro</a>
              </>
            ) : (
              <>
                <a href="/crear-restaurante" style={{ marginRight: "1rem" }}>➕ Añadir restaurante</a>
                <a href="/crear-publicacion" style={{ marginRight: "1rem" }}>✍️ Crear publicación</a>
                <a href="/perfil" style={{ marginRight: "1rem" }}>👤 Mi perfil</a>
                <button onClick={() => {
                  localStorage.removeItem("token");
                  window.location.reload();
                }}>
                  Cerrar sesión
                </button>
              </>
            )}
          </div>

          {/* Buscador de usuarios */}
          <BuscadorUsuarios />
        </div>

        <h1>Bites 🍽️</h1>

        <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
          <button onClick={() => setIsModalOpen(true)}>🔍 Filtros</button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setMostrarOrdenDropdown(!mostrarOrdenDropdown)}>
              📊 {ordenSeleccionado
                ? {
                    fecha_asc: "Fecha ascendente",
                    fecha_desc: "Fecha descendente",
                    valoracion_asc: "Valoración ascendente",
                    valoracion_desc: "Valoración descendente"
                  }[ordenSeleccionado]
                : "Ordenar"}
            </button>
            {mostrarOrdenDropdown && (
              <div style={{
                position: "absolute",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "5px",
                zIndex: 1000,
                marginTop: "0.5rem",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.1)"
              }}>
                {[
                  { label: "Fecha ascendente", value: "fecha_asc" },
                  { label: "Fecha descendente", value: "fecha_desc" },
                  { label: "Valoración ascendente", value: "valoracion_asc" },
                  { label: "Valoración descendente", value: "valoracion_desc" }
                ].map(({ label, value }) => (
                  <div
                    key={value}
                    onClick={() => {
                      setOrdenSeleccionado(value);
                      setMostrarOrdenDropdown(false);
                    }}
                    style={{
                      padding: "0.5rem 1rem",
                      cursor: "pointer",
                      backgroundColor: ordenSeleccionado === value ? "#eee" : "#fff"
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f0f0f0"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ordenSeleccionado === value ? "#eee" : "#fff"}
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Filtros"
          style={{
            content: {
              maxWidth: "500px",
              margin: "auto",
              padding: "2rem"
            }
          }}
        >
          <h2>Filtrar restaurantes</h2>
          <input type="text" name="localidad" placeholder="Localidad" value={filtros.localidad} onChange={handleFiltroChange} />
          <input type="text" name="tipo_cocina" placeholder="Tipo de cocina" value={filtros.tipo_cocina} onChange={handleFiltroChange} />
          <input type="number" name="precioMin" placeholder="Precio mínimo" value={filtros.precioMin} onChange={handleFiltroChange} />
          <input type="number" name="precioMax" placeholder="Precio máximo" value={filtros.precioMax} onChange={handleFiltroChange} />
          <input type="number" name="valoracionMin" placeholder="Valoración mínima" min="1" max="5" step="0.1" value={filtros.valoracionMin} onChange={handleFiltroChange} />
          <button onClick={aplicarFiltros}>Aplicar filtros</button>
          <button onClick={() => setIsModalOpen(false)} style={{ marginLeft: "1rem" }}>Cancelar</button>
        </Modal>

        <div
          style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", justifyItems: "stretch", padding: "1rem"}}>
          {restaurantes.map(r => (
            <Link to={`/restaurante/${r.id}`} key={r.id} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%"}}>
              <div style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "1rem", backgroundColor: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between"}}> 
                <img src={`${API_URL}${r.imagen}`} alt={r.nombre} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "1rem" }} />
                <h2>{r.nombre}</h2>
                <p>{r.tipo_cocina}</p>
                <p><strong>Localidad:</strong> {r.localidad}</p>
                <p><strong>Precio:</strong> {r.precio_medio}</p>
                <p>
                  <strong>Valoración:</strong> ⭐ {r.valoracion_media ? r.valoracion_media : "Sin reseñas"}
                  {r.cantidad_resenas !== undefined && r.cantidad_resenas > 0 && (
                    <> ({r.cantidad_resenas} reseña{r.cantidad_resenas > 1 ? "s" : ""})</>
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
