import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function RestauranteDetalle() {
const { id } = useParams();
const [restaurante, setRestaurante] = useState(null);
const [resenas, setResenas] = useState([]);

useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/restaurantes/${id}`)
    .then(res => res.json())
    .then(data => setRestaurante(data));

    fetch(`http://127.0.0.1:5000/api/resenas/restaurante/${id}`)
    .then(res => res.json())
    .then(data => setResenas(data));
}, [id]);

if (!restaurante) return <p>Cargando...</p>;

return (
    <div style={{ padding: "2rem" }}>
    <h1>{restaurante.nombre}</h1>
    <img src={restaurante.imagen} alt={restaurante.nombre} style={{ width: "100%", maxHeight: "400px", objectFit: "cover", borderRadius: "10px" }} />
    <p><strong>Tipo de cocina:</strong> {restaurante.tipo_cocina}</p>
    <p><strong>Dirección:</strong> {restaurante.direccion}</p>
    <p><strong>Precio medio:</strong> {restaurante.precio_medio}</p>
    <p><strong>Web:</strong> <a href={restaurante.url_web} target="_blank">{restaurante.url_web}</a></p>

    <h2 style={{ marginTop: "2rem" }}>Reseñas</h2>
    {resenas.length === 0 ? (
        <p>Aún no hay reseñas.</p>
    ) : (
        resenas.map(r => (
        <div key={r.id} style={{ background: "#f4f4f4", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
            <p><strong>{r.usuario}</strong> dijo:</p>
            <p>{r.comentario}</p>
            <p>⭐ {r.valoracion}/5 — {r.fecha}</p>
        </div>
        ))
    )}
    </div>
);
}

export default RestauranteDetalle;
