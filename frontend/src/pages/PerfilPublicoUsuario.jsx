  
    import { useParams } from "react-router-dom";
    import { useEffect, useState } from "react";
    import { toast } from "react-toastify";
    import { Swiper, SwiperSlide } from "swiper/react";
    import "swiper/css";

    export default function PerfilPublicoUsuario() {
    const { id } = useParams();
    const [usuario, setUsuario] = useState(null);
    const [publicaciones, setPublicaciones] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const cargarPerfilYPublicaciones = async () => {
        try {
            const [resUsuario, resPublicaciones] = await Promise.all([
            fetch(`${API_URL}/api/usuarios/${id}`),
            fetch(`${API_URL}/api/usuarios/${id}/publicaciones`)
            ]);

            if (!resUsuario.ok) throw new Error("Error al cargar perfil");
            if (!resPublicaciones.ok)
            throw new Error("Error al cargar publicaciones");

            const dataUsuario = await resUsuario.json();
            const dataPublicaciones = await resPublicaciones.json();

            setUsuario(dataUsuario);
            setPublicaciones(dataPublicaciones);
        } catch (err) {
            toast.error(err.message || "Error al cargar datos");
        }
        };

        cargarPerfilYPublicaciones();
    }, [API_URL, id]);

    if (!usuario) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500">Cargando perfil…</p>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
        {/* Encabezado de perfil público */}
        <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center gap-4">
            {/* Avatar con inicial */}
            <div className="h-20 w-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-4xl font-bold">
                {usuario.nombre.charAt(0)}
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
                {usuario.nombre}
            </h2>
            <p className="text-gray-600">
                Miembro desde{" "}
                {new Date(usuario.fecha_registro).toLocaleDateString()}
            </p>
            </div>
        </div>

        {/* Publicaciones */}
        <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Publicaciones de {usuario.nombre}
            </h3>
            {publicaciones.length === 0 ? (
            <p className="text-gray-600">
                Este usuario aún no ha publicado nada.
            </p>
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
                {Array.isArray(pub.media) && pub.media.length > 0 && (
                    <Swiper spaceBetween={10} slidesPerView={1}>
                    {pub.media.map((m, idx) => (
                        <SwiperSlide key={idx}>
                        {m.tipo === "video" ? (
                            <video
                            src={`${API_URL}${m.url}`}
                            controls
                            className="w-full rounded-lg"
                            />
                        ) : (
                            <img
                            src={`${API_URL}${m.url}`}
                            alt={`media-${idx}`}
                            className="w-full rounded-lg object-cover"
                            />
                        )}
                        </SwiperSlide>
                    ))}
                    </Swiper>
                )}
                <p className="text-sm text-gray-500">
                    Publicado el{" "}
                    {new Date(pub.fecha).toLocaleDateString()}
                </p>
                </div>
            ))
            )}
        </div>
        </div>
    );
    }
