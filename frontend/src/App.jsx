import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


function App() {
  const [restaurantes, setRestaurantes] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/restaurantes/`)
      .then(res => res.json())
      .then(data => setRestaurantes(data))
      .catch(err => console.error("Error al cargar restaurantes", err));
  }, []);

  const isAuthenticated = localStorage.getItem("token") !== null;



  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1rem" }}>
  {!isAuthenticated ? (
    <>
      <a href="/login" style={{ marginRight: "1rem" }}>Login</a>
      <a href="/register">Registro</a>
    </>
  ) : (
    <button onClick={() => {
      localStorage.removeItem("token");
      window.location.reload();
    }}>
      Cerrar sesión
    </button>
  )}
</div>



      <h1>Bites 🍽️</h1>
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
  );
} 


export default App;
