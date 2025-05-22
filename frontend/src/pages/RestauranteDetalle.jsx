    import { ToastContainer, toast } from "react-toastify";
    import 'react-toastify/dist/ReactToastify.css';
    import { useParams, useNavigate, Link } from "react-router-dom";
    import { useEffect, useState } from "react";
    import { FaCheckCircle } from 'react-icons/fa';
    import Comentarios from "../Comentarios";

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

    let userId = null;
    if (token) {
        try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.sub || payload.id;
        } catch (err) {
        console.error("Error al decodificar token:", err);
        }
    }

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
        return toast.error("El comentario debe tener al menos 10 caracteres.");
    }
    if (valoracion < 1 || valoracion > 5) {
        return toast.error("La valoración debe estar entre 1 y 5 estrellas.");
    }

    try {
        const res = await fetch(`${API_URL}/api/resenas/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ restaurante_id: restaurante.id, comentario, valoracion }),
        });

        const data = await res.json();

        if (res.ok) {
        setComentario("");
        setValoracion(5);
        const nuevasResenas = await fetch(`${API_URL}/api/resenas/restaurante/${id}`);
        const dataNuevas = await nuevasResenas.json();
        setResenas(dataNuevas);
        toast.success("¡Reseña publicada exitosamente!");
        } else {
        toast.error(data.msg || "Error al enviar reseña");
        }
    } catch (error) {
        toast.error("Error de red al enviar reseña");
    }
    };



    const handleDeleteResena = async (resenaId) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta reseña?")) return;

        const res = await fetch(`${API_URL}/api/resenas/${resenaId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
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
        body: JSON.stringify({ comentario: comentarioEditado, valoracion: valoracionEditada })
        });

        if (res.ok) {
        const data = await res.json();
        setResenas(resenas.map(r => r.id === editandoResenaId ? { ...r, comentario: data.comentario, valoracion: data.valoracion } : r));
        setEditandoResenaId(null);
        setComentarioEditado("");
        setValoracionEditada(5);
        toast.success("¡Reseña actualizada con éxito!");
        } else {
        toast.error("Error al actualizar reseña");
        }
    };

    if (!restaurante) return <p>Cargando...</p>;

        console.log("Token:", token);
        console.log("userId desde token:", userId);
        console.log("restaurante.creador_id:", restaurante.creador_id);
        console.log("Comparación:", restaurante.creador_id === userId);
    
    return (
        <div style={{ padding: "2rem" }}>
        <button onClick={() => navigate("/")} style={{ marginBottom: "1rem" }}>⬅️ Volver</button>

        {isAuthenticated && Number(restaurante.creador_id) === Number(userId) && (
        <>
        <button onClick={() => navigate(`/restaurantes/${restaurante.id}/editar`)}>
            Editar
        </button>
            <button
            onClick={async () => {
                if (window.confirm("¿Seguro que quieres eliminar este restaurante?")) {
                const res = await fetch(`${API_URL}/api/restaurantes/${restaurante.id}`, {
                    method: "DELETE",
                    headers: {
                    Authorization: `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    navigate("/", { replace: true, state: { mensaje: "eliminado", refrescar: true } });
                } else {
                    const data = await res.json();
                    toast.error(data.msg || "Error al eliminar");
                }
                }
            }}
            style={{ marginLeft: "1rem", backgroundColor: "red", color: "white" }}
            >
            Eliminar
            </button>
        </>
        )}

        
            


        <h1>{restaurante.nombre}</h1>
        <img src={`${API_URL}${restaurante.imagen}`} alt={restaurante.nombre} style={{ width: "100%", maxHeight: "400px", objectFit: "cover" }} />
        <p><strong>Tipo de cocina:</strong> {restaurante.tipo_cocina}</p>
        <p><strong>Dirección:</strong> {restaurante.direccion}</p>
        <p><strong>Precio medio:</strong> {restaurante.precio_medio}</p>
        <p><strong>Web:</strong> <a href={restaurante.url_web} target="_blank" rel="noreferrer">{restaurante.url_web}</a></p>

        {isAuthenticated && (
            <form onSubmit={handleSubmitResena} style={{ marginTop: "2rem" }}>
            <h3>Escribe tu reseña</h3>
            <textarea value={comentario} onChange={e => setComentario(e.target.value)} placeholder="¿Qué te pareció el restaurante?" required style={{ width: "100%", minHeight: "100px" }} />
            <div style={{ margin: "1rem 0" }}>
                <label>Valoración: </label>
                {[1, 2, 3, 4, 5].map(n => (
                <span key={n} onClick={() => setValoracion(n)} onMouseEnter={() => setHoverValoracion(n)} onMouseLeave={() => setHoverValoracion(0)} style={{ cursor: "pointer", fontSize: "1.5rem", color: (hoverValoracion || valoracion) >= n ? "#ffc107" : "#e4e5e9" }}>★</span>
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
                <p>
                <strong>
                    <Link to={`/usuarios/${r.usuario_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    {r.usuario}
                    </Link>
                </strong> dijo:
                </p>

                {editandoResenaId === r.id ? (
                <form onSubmit={handleUpdateResena} style={{ marginTop: "1rem" }}>
                    <textarea value={comentarioEditado} onChange={e => setComentarioEditado(e.target.value)} required style={{ width: "100%", minHeight: "80px" }} />
                    <div>
                    {[1, 2, 3, 4, 5].map(n => (
                        <span key={n} onClick={() => setValoracionEditada(n)} style={{ cursor: "pointer", fontSize: "1.5rem", color: n <= valoracionEditada ? "#ffc107" : "#e4e5e9" }}>★</span>
                    ))}
                    </div>
                    <br />
                    <button type="submit">Guardar cambios</button>
                    <button type="button" onClick={() => setEditandoResenaId(null)} style={{ marginLeft: "1rem" }}>Cancelar</button>
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
                    <button style={{ background: "red", color: "white" }} onClick={() => handleDeleteResena(r.id)}>Eliminar</button>
                </div>
                )}

                {/* Comentarios debajo de cada reseña */}
                <div style={{ marginTop: "1rem", paddingLeft: "1rem", borderLeft: "3px solid #ddd" }}>
                <Comentarios resenaId={r.id} />
                {!isAuthenticated && (
                    <p style={{ marginTop: "1rem", fontStyle: "italic", color: "#666" }}>
                    Inicia sesión para comentar en esta reseña.
                    </p>
                )}
                </div>
            </div>
            ))
        )}
        </div>
    );
    }

    export default RestauranteDetalle;
