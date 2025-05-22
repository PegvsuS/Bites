    import { useParams } from "react-router-dom";
    import { useEffect, useState } from "react";
    import { toast } from "react-toastify";

    function PerfilPublicoUsuario() {
    const { id } = useParams();
    const [usuario, setUsuario] = useState(null);
    const [publicaciones, setPublicaciones] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const cargarPerfilYPublicaciones = async () => {
        try {
            const resUsuario = await fetch(`${API_URL}/api/usuarios/${id}`);
            const dataUsuario = await resUsuario.json();
            setUsuario(dataUsuario);

            const resPublicaciones = await fetch(`${API_URL}/api/usuarios/${id}/publicaciones`);
            const dataPublicaciones = await resPublicaciones.json();
            setPublicaciones(dataPublicaciones);
        } catch (err) {
            toast.error("Error al cargar perfil o publicaciones");
        }
        };

        cargarPerfilYPublicaciones();
    }, [id]);

    if (!usuario) return <p>Cargando perfil...</p>;

    return (
        <div style={{ padding: "2rem" }}>
        <h2>Perfil de {usuario.nombre}</h2>
        <p>Miembro desde {usuario.fecha_registro}</p>

        <h3 style={{ marginTop: "2rem" }}>Publicaciones</h3>
        {publicaciones.length === 0 ? (
            <p>Este usuario aún no ha publicado nada.</p>
        ) : (
            publicaciones.map(pub => (
            <div key={pub.id} style={{ background: "#f4f4f4", padding: "1rem", marginBottom: "1rem", borderRadius: "8px" }}>
                <p>{pub.contenido}</p>

                {/* Si en el futuro añades imagen, aquí puedes mostrarla */}
                {/* pub.imagen && (
                <img src={`${API_URL}${pub.imagen}`} alt="Imagen" style={{ maxWidth: "100%", marginTop: "0.5rem", borderRadius: "6px" }} />
                ) */}

                {pub.restaurante_etiquetado && (
                <p style={{ fontStyle: "italic", color: "#333" }}>
                    📍 Etiquetado: {pub.restaurante_etiquetado}
                </p>
                )}
                <p style={{ fontSize: "0.9rem", color: "#666" }}>Publicado el {pub.fecha}</p>
            </div>
            ))
        )}
        </div>
    );
    }

    export default PerfilPublicoUsuario;
