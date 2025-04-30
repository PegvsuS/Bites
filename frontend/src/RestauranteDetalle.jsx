    import { useParams, useNavigate } from "react-router-dom";
    import { useEffect, useState } from "react";
    import { toast } from 'react-toastify';

    import { FaCheckCircle } from 'react-icons/fa';


    function RestauranteDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [restaurante, setRestaurante] = useState(null);
    const [resenas, setResenas] = useState([]);
    const [comentario, setComentario] = useState("");
    const [valoracion, setValoracion] = useState(5);
    const [hoverValoracion, setHoverValoracion] = useState(0);
    const [editandoResenaId, setEditandoResenaId] = useState(null);
    const [comentarioEditado, setComentarioEditado] = useState("");
    const [valoracionEditada, setValoracionEditada] = useState(5);

    const API_URL = import.meta.env.VITE_API_URL;

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

        if (comentario.trim().length < 10) {
        toast.error("El comentario debe tener al menos 10 caracteres.");
        return;
        }

        if (valoracion < 1 || valoracion > 5) {
        toast.error("La valoración debe estar entre 1 y 5 estrellas.");
        return;
        }

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
        toast.success("¡Reseña publicada exitosamente!");
        } else {
        toast.error(data.msg || "Error al enviar reseña");
        }
    };

    const handleDeleteResena = async (resenaId) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta reseña?")) return;

        const res = await fetch(`${API_URL}/api/resenas/${resenaId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
        });

        if (res.ok) {
        setResenas(resenas.filter(r => r.id !== resenaId));
        toast.success("¡Reseña eliminada correctamente!");
        } else {
        toast.error("Error al eliminar la reseña");
        }
    };

    const handleUpdateResena = async (e) => {
        e.preventDefault();

        const res = await fetch(`${API_URL}/api/resenas/${editandoResenaId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            comentario: comentarioEditado,
            valoracion: valoracionEditada
        })
        });

        if (res.ok) {
        const data = await res.json();

        setResenas(resenas.map(r => 
            r.id === editandoResenaId 
            ? { ...r, comentario: data.comentario, valoracion: data.valoracion }
            : r
        ));
        setEditandoResenaId(null);
        setComentarioEditado("");
        setValoracionEditada(5);

        toast.success("¡Reseña actualizada con éxito!");
        } else {
        toast.error("Error al actualizar reseña");
        }
    };

    // 🟩 Aquí el correcto sitio del return condicional:
    if (!restaurante) {
        return <p>Cargando...</p>;
    }

    return (
        <div style={{ padding: "2rem" }}>
        {/* Botón de volver */}
        <button 
            onClick={() => navigate("/")}
            style={{
            marginBottom: "1rem",
            background: "#eee",
            border: "none",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            borderRadius: "5px"
            }}
        >
            ⬅️ Volver
        </button>

        {/* Restaurante */}
        <h1>{restaurante.nombre}</h1>
        <img src={restaurante.imagen} alt={restaurante.nombre} style={{ width: "100%", maxHeight: "400px", objectFit: "cover", borderRadius: "10px" }} />
        <p><strong>Tipo de cocina:</strong> {restaurante.tipo_cocina}</p>
        <p><strong>Dirección:</strong> {restaurante.direccion}</p>
        <p><strong>Precio medio:</strong> {restaurante.precio_medio}</p>
        <p><strong>Web:</strong> <a href={restaurante.url_web} target="_blank" rel="noreferrer">{restaurante.url_web}</a></p>

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
            <div style={{ margin: "1rem 0" }}>
                <label>Valoración: </label>
                {[1, 2, 3, 4, 5].map(n => (
                <span
                    key={n}
                    onClick={() => setValoracion(n)}
                    onMouseEnter={() => setHoverValoracion(n)}
                    onMouseLeave={() => setHoverValoracion(0)}
                    style={{
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    color: (hoverValoracion || valoracion) >= n ? "#ffc107" : "#e4e5e9"
                    }}
                >
                    ★
                </span>
                ))}
            </div>
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

                {editandoResenaId === r.id ? (
                <form onSubmit={handleUpdateResena} style={{ marginTop: "1rem" }}>
                    <textarea
                    value={comentarioEditado}
                    onChange={e => setComentarioEditado(e.target.value)}
                    required
                    style={{ width: "100%", minHeight: "80px" }}
                    />
                    <div>
                    {[1, 2, 3, 4, 5].map(n => (
                        <span
                        key={n}
                        onClick={() => setValoracionEditada(n)}
                        style={{
                            cursor: "pointer",
                            fontSize: "1.5rem",
                            color: n <= valoracionEditada ? "#ffc107" : "#e4e5e9"
                        }}
                        >
                        ★
                        </span>
                    ))}
                    </div>
                    <br />
                    <button type="submit">Guardar cambios</button>
                    <button type="button" onClick={() => setEditandoResenaId(null)} style={{ marginLeft: "1rem" }}>
                    Cancelar
                    </button>
                </form>
                ) : (
                <>
                    <p>{r.comentario}</p>
                    <p>⭐ {r.valoracion}/5 — {r.fecha}</p>
                </>
                )}

                {isAuthenticated && Number(localStorage.getItem("user_id")) === r.usuario_id && (
                    <div style={{ marginTop: "0.5rem" }}>
                    <button style={{ marginRight: "0.5rem" }} onClick={() => {
                        setEditandoResenaId(r.id);
                        setComentarioEditado(r.comentario);
                        setValoracionEditada(r.valoracion);
                    }}>Editar</button>
                    <button style={{ background: "red", color: "white" }} onClick={() => handleDeleteResena(r.id)}>
                        Eliminar
                    </button>
                    </div>
                )}
                </div>
                ))
            )}
        </div>
        );
    }

    export default RestauranteDetalle;
