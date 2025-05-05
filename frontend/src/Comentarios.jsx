    import { useState, useEffect } from "react";
    import { toast } from "react-toastify";

    function Comentarios({ resenaId }) {
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const token = localStorage.getItem("token");
    const userId = Number(localStorage.getItem("user_id"));
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetch(`${API_URL}/api/comentarios/resena/${resenaId}`)
        .then(res => res.json())
        .then(data => setComentarios(data))
        .catch(err => console.error("Error al cargar comentarios", err));
    }, [resenaId]);

    const enviarComentario = async () => {
        if (!nuevoComentario.trim()) return;

        const res = await fetch(`${API_URL}/api/comentarios/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ texto: nuevoComentario, resena_id: resenaId })
        });

        const data = await res.json();
        if (res.ok) {
        toast.success("Comentario publicado");
        setNuevoComentario("");
        setComentarios([
            ...comentarios,
            {
            id: data.id,
            texto: nuevoComentario,
            usuario_id: userId,
            fecha: new Date().toISOString(),
            likes: 0
            }
        ]);
        } else {
        toast.error(data.msg || "Error al comentar");
        }
    };

    const toggleLike = async (comentarioId) => {
        const res = await fetch(`${API_URL}/api/comentarios/${comentarioId}/like`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
        });

        if (res.ok) {
        setComentarios(prev =>
            prev.map(c =>
            c.id === comentarioId
                ? { ...c, likes: c.likes + (c.liked ? -1 : 1), liked: !c.liked }
                : c
            )
        );
        }
    };

    const eliminarComentario = async (comentarioId) => {
        const confirmar = window.confirm("¿Eliminar comentario?");
        if (!confirmar) return;

        const res = await fetch(`${API_URL}/api/comentarios/${comentarioId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
        });

        if (res.ok) {
        setComentarios(comentarios.filter(c => c.id !== comentarioId));
        toast.success("Comentario eliminado");
        } else {
        toast.error("Error al eliminar");
        }
    };

    return (
        <div>
        {comentarios.map(c => (
            <div key={c.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #ccc" }}>
            <p>{c.texto}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {token && (
                <span
                onClick={() => toggleLike(c.id)}
                style={{
                    cursor: "pointer",
                    color: c.liked ? "blue" : "#555",
                    fontWeight: c.liked ? "bold" : "normal"
                }}
                >
                    👍 {c.likes}
                </span>
                )}
                {token && c.usuario_id === userId && (
                <button onClick={() => eliminarComentario(c.id)} style={{ fontSize: "0.8rem", color: "red" }}>
                    Eliminar
                </button>
                )}
            </div>
            </div>
        ))}

        {token && (
            <div style={{ marginTop: "0.5rem" }}>
            <textarea
                value={nuevoComentario}
                onChange={e => setNuevoComentario(e.target.value)}
                placeholder="Escribe un comentario..."
                style={{ width: "100%", minHeight: "60px" }}
            />
            <button onClick={enviarComentario}>Comentar</button>
            </div>
        )}
        </div>
    );
    }

    export default Comentarios;
