import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function RestauranteDetalle() {
const { id } = useParams();
const [restaurante, setRestaurante] = useState(null);
const [resenas, setResenas] = useState([]);
const [comentario, setComentario] = useState("");
const [valoracion, setValoracion] = useState(5);


const API_URL = import.meta.env.VITE_API_URL;

// Verificar si el usuario está autenticado, aquí si hay token en localStorage se considera autenticado.
const token = localStorage.getItem("token");
const isAuthenticated = token !== null;

useEffect(() => {
    fetch(`${API_URL}/api/restaurantes/${id}`)
    .then(res => res.json())
    .then(data => setRestaurante(data));

    fetch(`${API_URL}/api/resenas/restaurante/${id}`)
    .then(res => res.json())
    .then(data => setResenas(data));
}, [id]);

const handleSubmitResena = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/api/resenas/`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
        restaurante_id: restaurante.id,
        comentario,
        valoracion
    })
    });

    const data = await res.json();
    if (res.ok) {
    setComentario("");
    setValoracion(5);
    setResenas([...resenas, {
        ...data.nuevaResena,
        usuario: "Tú",
        fecha: new Date().toISOString().split("T")[0]
    }]);
    } else {
    alert(data.msg || "Error al enviar reseña");
    }
};

if (!restaurante) return <p>Cargando...</p>;

return (
    <div style={{ padding: "2rem" }}>
    <h1>{restaurante.nombre}</h1>
    <img src={restaurante.imagen} alt={restaurante.nombre} style={{ width: "100%", maxHeight: "400px", objectFit: "cover", borderRadius: "10px" }} />
    <p><strong>Tipo de cocina:</strong> {restaurante.tipo_cocina}</p>
    <p><strong>Dirección:</strong> {restaurante.direccion}</p>
    <p><strong>Precio medio:</strong> {restaurante.precio_medio}</p>
    <p><strong>Web:</strong> <a href={restaurante.url_web} target="_blank">{restaurante.url_web}</a></p>


    {isAuthenticated && (
<form onSubmit={handleSubmitResena} style={{ marginTop: "2rem" }}>
    <h3>Escribe tu reseña</h3>
    <textarea
    value={comentario}
    onChange={e => setComentario(e.target.value)}
    placeholder="¿Qué te pareció el restaurante?"
    required
    style={{ width: "100%", minHeight: "100px", marginBottom: "1rem" }}
    />
    <br />
    <label>Valoración: </label>
    <select value={valoracion} onChange={e => setValoracion(Number(e.target.value))}>
    {[1, 2, 3, 4, 5].map(n => (
        <option key={n} value={n}>{n} ⭐</option>
    ))}
    </select>
    <br /><br />
    <button type="submit">Enviar reseña</button>
</form>
)}


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
