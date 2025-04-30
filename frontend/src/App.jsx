import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Requerido por accesibilidad

function App() {
  const [restaurantes, setRestaurantes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    localidad: "",
    tipo_cocina: "",
    precioMin: "",
    precioMax: ""
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

  const aplicarFiltros = () => {
    const query = [];

    if (filtros.localidad) query.push(`localidad=${filtros.localidad}`);
    if (filtros.tipo_cocina) query.push(`tipo_cocina=${filtros.tipo_cocina}`);
    if (filtros.precioMin) query.push(`precio_min=${filtros.precioMin}`);
    if (filtros.precioMax) query.push(`precio_max=${filtros.precioMax}`);

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
        <div style={{ marginBottom: "1rem" }}>
          {!isAuthenticated ? (
            <>
              <a href="/login" style={{ marginRight: "1rem" }}>Login</a>
              <a href="/register">Registro</a>
            </>
          ) : (
            <>
              <a href="/crear-restaurante" style={{ marginRight: "1rem" }}>➕ Añadir restaurante</a>
              <button onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}>
                Cerrar sesión
              </button>
            </>
          )}
        </div>

        <h1>Bites 🍽️</h1>

        {/* Botón de filtros */}
        <button
          style={{ marginBottom: "1rem" }}
          onClick={() => setIsModalOpen(true)}
        >
          🔍 Filtros
        </button>

        {/* Modal de filtros */}
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
          <input
            type="text"
            name="localidad"
            placeholder="Localidad"
            value={filtros.localidad}
            onChange={handleFiltroChange}
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
          />
          <input
            type="text"
            name="tipo_cocina"
            placeholder="Tipo de cocina"
            value={filtros.tipo_cocina}
            onChange={handleFiltroChange}
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
          />
          <input
            type="number"
            name="precioMin"
            placeholder="Precio mínimo (€)"
            value={filtros.precioMin}
            onChange={handleFiltroChange}
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
          />
          <input
            type="number"
            name="precioMax"
            placeholder="Precio máximo (€)"
            value={filtros.precioMax}
            onChange={handleFiltroChange}
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
          />

          <button onClick={aplicarFiltros}>Aplicar filtros</button>
          <button onClick={() => setIsModalOpen(false)} style={{ marginLeft: "1rem" }}>
            Cancelar
          </button>
        </Modal>

        {/* Listado de restaurantes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          {restaurantes.map(r => (
            <Link to={`/restaurante/${r.id}`} key={r.id} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "1rem" }}>
                <img src={r.imagen} alt={r.nombre} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }} />
                <h2>{r.nombre}</h2>
                <p>{r.tipo_cocina}</p>
                <p><strong>Localidad:</strong> {r.localidad}</p>
                <p><strong>Precio:</strong> {r.precio_medio}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
