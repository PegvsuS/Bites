import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.mensaje === "eliminado") {
      toast.success("Restaurante eliminado correctamente");
      fetchRestaurantes();
      navigate("/", { replace: true });
    }
  }, [location]);

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

      {/* BARRA SUPERIOR FIJA */}
      {isAuthenticated ? (
        <div className="w-full bg-white grid grid-cols-3 items-center fixed top-0 left-0 z-50 py-4 px-6">
          {/* IZQUIERDA */}
          <div className="flex gap-4">
            <a href="/perfil" className="text-blue-600 font-medium flex items-center gap-1">
              👤 Mi perfil
            </a>
            <a href="/configuracion" className="text-blue-600 font-medium flex items-center gap-1">
              ⚙️ Configuración
            </a>
          </div>

          {/* CENTRO */}
          <div className="flex justify-center gap-4">
            <a href="/crear-restaurante" className="text-blue-600 font-medium flex items-center gap-1">
              ➕ Añadir restaurante
            </a>
            <BuscadorUsuarios />
          </div>

          {/* DERECHA */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
              className="bg-red-300 hover:bg-red-500 text-black font-semibold px-4 py-2 rounded"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white grid grid-cols-3 items-center fixed top-0 left-0 z-50 py-4 px-6">
          <div></div> {/* IZQUIERDA VACÍA */}
          <div></div> {/* CENTRO VACÍO */}
          <div className="flex justify-end gap-4">
            <a href="/login" className="text-blue-600 font-medium">Login</a>
            <a href="/register" className="text-blue-600 font-medium">Registro</a>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="mt-24 w-full">
        <div className="flex justify-center mb-20">
          <h1 className="text-3xl font-bold">Bites</h1>
        </div>

        <div className="flex justify-end gap-4 mb-8 px-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded"
          >
            🔍 Filtros
          </button>

          <div className="relative">
            <button
              onClick={() => setMostrarOrdenDropdown(!mostrarOrdenDropdown)}
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded"
            >
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
              <div className="absolute bg-white border border-gray-300 rounded shadow-md mt-2 right-0 z-50">
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
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      ordenSeleccionado === value ? "bg-gray-100" : ""
                    }`}
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

        <div className="w-full px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {restaurantes.map(r => (
            <Link to={`/restaurantes/${r.id}`} key={r.id} className="no-underline text-black">
              <div className="border border-gray-300 rounded-lg p-4">
                <img src={`${API_URL}${r.imagen}`} alt={r.nombre} className="w-full h-48 object-cover rounded-md mb-2" />
                <h2>{r.nombre}</h2>
                <p>{r.tipo_cocina}</p>
                <p><strong>Localidad:</strong> {r.localidad}</p>
                <p><strong>Precio:</strong> {r.precio_medio}</p>
                <p>
                  <strong>Valoración:</strong> ⭐ {r.valoracion_media ?? "Sin reseñas"}
                  {r.cantidad_resenas > 0 && (
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
