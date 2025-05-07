    // src/pages/PerfilPublicoUsuario.jsx
    import { useParams, useNavigate } from "react-router-dom";
    import { useEffect, useState } from "react";
    import { toast } from "react-toastify";

    function PerfilPublicoUsuario() {
    const { id } = useParams();
    const [usuario, setUsuario] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPerfil = async () => {
        try {
            const res = await fetch(`${API_URL}/api/usuarios/${id}`);
            if (!res.ok) throw new Error("No se pudo cargar el perfil del usuario");
            const data = await res.json();
            setUsuario(data);
        } catch (err) {
            toast.error(err.message);
            navigate("/");
        }
        };

        fetchPerfil();
    }, [API_URL, id, navigate]);

    if (!usuario) return <p>Cargando perfil del usuario...</p>;

    return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
        <button onClick={() => navigate("/")} style={{ marginBottom: "1rem" }}>
            ⬅️ Volver
        </button>
        <h1>Perfil de {usuario.nombre}</h1>
        <p><strong>Email:</strong> {usuario.email}</p>
        <p><strong>Miembro desde:</strong> {usuario.fecha_registro}</p>

        <h2 style={{ marginTop: "2rem" }}>Reseñas de {usuario.nombre}</h2>
        {usuario.resenas.length === 0 ? (
            <p>Este usuario aún no ha escrito reseñas.</p>
        ) : (
            usuario.resenas.map(r => (
            <div key={r.id} style={{ background: "#f9f9f9", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
                <p><strong>Restaurante ID:</strong> {r.restaurante_id}</p>
                <p>{r.comentario}</p>
                <p>⭐ {r.valoracion}/5 — {r.fecha}</p>
            </div>
            ))
        )}
        </div>
    );
    }

    export default PerfilPublicoUsuario;
