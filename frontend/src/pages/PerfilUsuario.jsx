    import { useEffect, useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { toast } from "react-toastify";
    import { Swiper, SwiperSlide } from "swiper/react";
    import "swiper/css";


    function PerfilUsuario() {
    const [usuario, setUsuario] = useState(null);
    const [publicaciones, setPublicaciones] = useState([]);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    useEffect(() => {
        const obtenerPerfil = async () => {
        try {
            const res = await fetch(`${API_URL}/api/usuarios/perfil`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
            });
            const data = await res.json();
            if (res.ok) {
            setUsuario(data);
            } else {
            toast.error(data.msg || "Error al obtener perfil");
            }
        } catch (err) {
            toast.error("Error de red al obtener perfil");
        }
        };

        const obtenerPublicaciones = async () => {
        try {
            const res = await fetch(`${API_URL}/api/publicaciones/mias`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
            });
            const data = await res.json();
            if (res.ok) {
            setPublicaciones(data);
            } else {
            toast.error(data.msg || "Error al obtener publicaciones");
            }
        } catch (err) {
            toast.error("Error de red al obtener publicaciones");
        }
        };

        obtenerPerfil();
        obtenerPublicaciones();
    }, [API_URL, token]);

    const eliminarPublicacion = async (id) => {
        if (!window.confirm("¿Eliminar esta publicación?")) return;

        try {
        const res = await fetch(`${API_URL}/api/publicaciones/${id}`, {
            method: "DELETE",
            headers: {
            Authorization: `Bearer ${token}`
            }
        });

        if (res.ok) {
            setPublicaciones(publicaciones.filter(p => p.id !== id));
            toast.success("Publicación eliminada");
        } else {
            const data = await res.json();
            toast.error(data.msg || "Error al eliminar");
        }
        } catch (err) {
        toast.error("Error de red al eliminar");
        }
    };

    if (!usuario) return <p>Cargando perfil...</p>;

    return (
        <div style={{ padding: "2rem" }}>
        <h2>Mi perfil</h2>
        <p><strong>Nombre:</strong> {usuario.nombre}</p>
        <p><strong>Email:</strong> {usuario.email}</p>
        <p><strong>Miembro desde:</strong> {usuario.fecha_registro}</p>

        <h3 style={{ marginTop: "2rem" }}>Mis publicaciones</h3>
        {publicaciones.length === 0 ? (
            <p>No has publicado nada aún.</p>
        ) : (
            publicaciones.map(pub => (
            <div key={pub.id} style={{ background: "#f9f9f9", padding: "1rem", marginBottom: "1rem", borderRadius: "8px" }}>
                <p>{pub.contenido}</p>
                <p style={{ fontSize: "0.9rem", color: "#666" }}>{pub.fecha}</p>

                {pub.media && pub.media.length > 0 && (
                <Swiper spaceBetween={10} slidesPerView={1}>
                    {pub.media.map((m, i) => (
                    <SwiperSlide key={i}>
                        {m.tipo === "video" ? (
                        <video src={`${API_URL}${m.url}`} controls style={{ width: "100%", borderRadius: "8px" }} />
                        ) : (
                        <img src={`${API_URL}${m.url}`} alt="media" style={{ width: "100%", borderRadius: "8px" }} />
                        )}
                    </SwiperSlide>
                    ))}
                </Swiper>
                )}

                {/* Botones de editar y eliminar */}
                <div style={{ marginTop: "0.5rem" }}>
                <button
                    onClick={() => navigate(`/publicaciones/${pub.id}/editar`)}
                    style={{ marginRight: "0.5rem" }}
                >
                    Editar
                </button>
                <button
                    onClick={() => eliminarPublicacion(pub.id)}
                    style={{ background: "red", color: "white" }}
                >
                    Eliminar
                </button>
                </div>
            </div>
            ))
        )}

        <h3 style={{ marginTop: "2rem" }}>Mis reseñas</h3>
        {usuario.resenas.length === 0 ? (
            <p>No has escrito ninguna reseña aún.</p>
        ) : (
            usuario.resenas.map(r => (
            <div key={r.id} style={{ background: "#eee", padding: "1rem", marginBottom: "1rem", borderRadius: "8px" }}>
                <p><strong>Restaurante ID:</strong> {r.restaurante_id}</p>
                <p>{r.comentario}</p>
                <p>⭐ {r.valoracion}/5 — {r.fecha}</p>
            </div>
            ))
        )}
        </div>
    );
    }

    export default PerfilUsuario;
