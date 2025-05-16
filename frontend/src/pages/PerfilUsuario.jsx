    import { useEffect, useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { toast } from "react-toastify";

    function PerfilUsuario() {
    const [usuario, setUsuario] = useState(null);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/login";
        return null;
    }

    useEffect(() => {
        const obtenerPerfil = async () => {
        try {
            const res = await fetch(`${API_URL}/api/usuarios/perfil`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });

            if (!res.ok) {
            throw new Error("No se pudo cargar el perfil");
            }

            const data = await res.json();
            setUsuario(data);
        } catch (err) {
            toast.error(err.message);
            navigate("/login");
        }
        };

        obtenerPerfil();
    }, [API_URL, token, navigate]);

    if (!usuario) return <p>Cargando perfil...</p>;

    return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
        <button
            onClick={() => navigate("/")}
            style={{
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#ddd",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            }}
        >
            ⬅️ Volver al inicio
        </button>

        <h1>Mi Perfil</h1>
        <p>
            <strong>Nombre:</strong> {usuario.nombre}
        </p>
        <p>
            <strong>Email:</strong> {usuario.email}
        </p>
        <p>
            <strong>Miembro desde:</strong> {usuario.fecha_registro}
        </p>

        <h2 style={{ marginTop: "2rem" }}>Mis reseñas</h2>
        {usuario.resenas.length === 0 ? (
            <p>Aún no has escrito reseñas.</p>
        ) : (
            usuario.resenas.map((r) => (
            <div
                key={r.id}
                style={{
                background: "#f9f9f9",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                }}
            >
                <p>
                <strong>Restaurante ID:</strong> {r.restaurante_id}
                </p>
                <p>{r.comentario}</p>
                <p>⭐ {r.valoracion}/5 — {r.fecha}</p>
            </div>
            ))
        )}

        <h2 style={{ marginTop: "2rem" }}>Mis publicaciones</h2>
        {usuario.publicaciones && usuario.publicaciones.length > 0 ? (
            usuario.publicaciones.map((p) => (
            <div
                key={p.id}
                style={{
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
                }}
            >
                <p style={{ whiteSpace: "pre-line" }}>{p.contenido}</p>
                {p.etiqueta_restaurante && (
                <p>
                    📍 <strong>Etiqueta:</strong> {p.etiqueta_restaurante}
                </p>
                )}
                <p style={{ fontSize: "0.9rem", color: "#666" }}>{p.fecha}</p>
            </div>
            ))
        ) : (
            <p>No has hecho publicaciones aún.</p>
        )}
        </div>
    );
    }

    export default PerfilUsuario;
