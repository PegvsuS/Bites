
    import { useEffect, useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { toast } from "react-toastify";
    import { Swiper, SwiperSlide } from "swiper/react";
    import "swiper/css";

    export default function PerfilUsuario() {
    const [usuario, setUsuario] = useState(null);
    const [publicaciones, setPublicaciones] = useState([]);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    useEffect(() => {
        const obtenerPerfil = async () => {
        try {
            const res = await fetch(`${API_URL}/api/usuarios/perfil`, {
            headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setUsuario(data);
            else toast.error(data.msg || "Error al obtener perfil");
        } catch {
            toast.error("Error de red al obtener perfil");
        }
        };

        const obtenerPublicaciones = async () => {
        try {
            const res = await fetch(`${API_URL}/api/publicaciones/mias`, {
            headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setPublicaciones(data);
            else toast.error(data.msg || "Error al obtener publicaciones");
        } catch {
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
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setPublicaciones(publicaciones.filter((p) => p.id !== id));
            toast.success("Publicación eliminada");
        } else {
            const data = await res.json();
            toast.error(data.msg || "Error al eliminar");
        }
        } catch {
        toast.error("Error de red al eliminar");
        }
    };

    if (!usuario) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500">Cargando perfil…</p>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
        {/* Datos de usuario */}
        <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Aquí podrías añadir avatar si lo tuvieras */}
            <div className="flex-shrink-0">
                <div className="h-24 w-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl font-bold">
                {usuario.nombre.charAt(0)}
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-1">
                {usuario.nombre}
                </h2>
                <p className="text-gray-600 mb-1">
                <strong>Email:</strong> {usuario.email}
                </p>
                <p className="text-gray-600">
                <strong>Miembro desde:</strong>{" "}
                {new Date(usuario.fecha_registro).toLocaleDateString()}
                </p>
            </div>
            </div>
        </div>

        {/* Sección de publicaciones */}
        <div className="max-w-3xl mx-auto mb-12">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Mis publicaciones
            </h3>
            {publicaciones.length === 0 ? (
            <p className="text-gray-600">No has publicado nada aún.</p>
            ) : (
            publicaciones.map((pub) => (
                <div
                key={pub.id}
                className="bg-white shadow rounded-lg p-6 mb-6 space-y-4"
                >
                {pub.restaurante_etiquetado && (
                    <p className="text-purple-600 font-medium">
                    📍 Restaurante: {pub.restaurante_etiquetado}
                    </p>
                )}
                <p className="text-gray-800">{pub.contenido}</p>
                <p className="text-sm text-gray-500">
                    {new Date(pub.fecha).toLocaleString()}
                </p>

                {pub.media && pub.media.length > 0 && (
                    <Swiper spaceBetween={10} slidesPerView={1}>
                    {pub.media.map((m, i) => (
                        <SwiperSlide key={i}>
                        {m.tipo === "video" ? (
                            <video
                            src={`${API_URL}${m.url}`}
                            controls
                            className="w-full rounded-lg"
                            />
                        ) : (
                            <img
                            src={`${API_URL}${m.url}`}
                            alt="media"
                            className="w-full rounded-lg object-cover"
                            />
                        )}
                        </SwiperSlide>
                    ))}
                    </Swiper>
                )}

                <div className="flex justify-end gap-3">
                    <button
                    onClick={() =>
                        navigate(`/publicaciones/${pub.id}/editar`)
                    }
                    className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded-md hover:bg-yellow-300 transition"
                    >
                    Editar
                    </button>
                    <button
                    onClick={() => eliminarPublicacion(pub.id)}
                    className="px-4 py-2 bg-red-200 text-red-800 rounded-md hover:bg-red-300 transition"
                    >
                    Eliminar
                    </button>
                </div>
                </div>
            ))
            )}
        </div>

        {/* Sección de reseñas */}
        <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Mis reseñas
            </h3>
            {usuario.resenas.length === 0 ? (
            <p className="text-gray-600">No has escrito ninguna reseña aún.</p>
            ) : (
            usuario.resenas.map((r) => (
                <div
                key={r.id}
                className="bg-white shadow rounded-lg p-6 mb-4"
                >
                <p className="text-gray-800 mb-1">
                    <strong>Restaurante ID:</strong> {r.restaurante_id}
                </p>
                <p className="text-gray-700 mb-1">{r.comentario}</p>
                <p className="text-sm text-gray-500">
                    ⭐ {r.valoracion}/5 —{" "}
                    {new Date(r.fecha).toLocaleDateString()}
                </p>
                </div>
            ))
            )}
        </div>
        </div>
    );
    }
