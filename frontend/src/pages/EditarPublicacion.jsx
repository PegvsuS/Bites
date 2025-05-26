    import { useEffect, useState } from "react";
    import { useParams, useNavigate } from "react-router-dom";
    import { toast } from "react-toastify";
    import { Swiper, SwiperSlide } from "swiper/react";
    import "swiper/css";

    export default function EditarPublicacion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const [contenido, setContenido] = useState("");
    const [restauranteEtiquetado, setRestauranteEtiquetado] = useState("");
    const [mediaExistente, setMediaExistente] = useState([]);
    const [mediaEliminada, setMediaEliminada] = useState([]);
    const [archivosNuevos, setArchivosNuevos] = useState([]);
    const [previews, setPreviews] = useState([]);

    // Carga de datos
    useEffect(() => {
        const cargar = async () => {
        try {
            const res = await fetch(`${API_URL}/api/publicaciones/${id}`);
            const data = await res.json();
            if (res.ok) {
            setContenido(data.contenido);
            setRestauranteEtiquetado(data.restaurante_etiquetado || "");
            setMediaExistente(data.media || []);
            } else {
            toast.error(data.msg || "Error al cargar");
            }
        } catch {
            toast.error("Error de red");
        }
        };
        cargar();
    }, [id]);

    // Limpieza de previews
    useEffect(() => {
        return () => previews.forEach(p => URL.revokeObjectURL(p.url));
    }, [previews]);

    // Manejo de nuevos archivos
    const handleArchivos = e => {
        const files = Array.from(e.target.files);
        const valid = files.filter(f =>
        f.type.startsWith("image/") || f.type.startsWith("video/")
        );
        if (valid.length !== files.length) {
        toast.error("Solo imágenes o vídeos");
        }
        if (valid.length + mediaExistente.length + archivosNuevos.length > 10) {
        toast.error("Máximo 10 items");
        return;
        }
        setArchivosNuevos(prev => [...prev, ...valid]);
        const newPreviews = valid.map(f => ({
        url: URL.createObjectURL(f),
        type: f.type.startsWith("video") ? "video" : "image"
        }));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    // Eliminar media existente
    const eliminarExistente = idx => {
        setMediaEliminada(prev => [...prev, mediaExistente[idx].id]);
        setMediaExistente(prev => prev.filter((_, i) => i !== idx));
    };

    // Submit
    const handleSubmit = async e => {
        e.preventDefault();
        const form = new FormData();
        form.append("contenido", contenido);
        form.append("restaurante_etiquetado", restauranteEtiquetado);
        archivosNuevos.forEach(f => form.append("media", f));
        mediaEliminada.forEach(id => form.append("media_eliminada", id));

        try {
        const res = await fetch(`${API_URL}/api/publicaciones/${id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: form
        });
        const data = await res.json();
        if (res.ok) {
            toast.success("Publicación actualizada");
            navigate("/perfil");
        } else {
            toast.error(data.msg || "Error al actualizar");
        }
        } catch {
        toast.error("Error de red");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 space-y-6"
        >
            <h2 className="text-2xl font-semibold text-gray-800 text-center">
            Editar Publicación
            </h2>

            {/* Contenido */}
            <textarea
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            placeholder="¿Qué quieres compartir?"
            className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            />

            {/* Restaurante etiquetado */}
            <input
            type="text"
            value={restauranteEtiquetado}
            onChange={e => setRestauranteEtiquetado(e.target.value)}
            placeholder="Etiqueta un restaurante (opcional)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />

            {/* Subida de archivos */}
            <div>
            <label className="block mb-2 text-gray-700 font-medium">
                Añadir imágenes o vídeos
            </label>
            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors">
                <input
                id="files"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleArchivos}
                className="hidden"
                />
                <label
                htmlFor="files"
                className="cursor-pointer text-purple-600 hover:text-purple-800"
                >
                Selecciona o arrastra aquí
                </label>
            </div>
            </div>

            {/* Vista previa y existente */}
            {(mediaExistente.length > 0 || previews.length > 0) && (
            <Swiper slidesPerView={1} spaceBetween={10} className="my-4">
                {/* Existente */}
                {mediaExistente.map((m, i) => (
                <SwiperSlide key={`old-${i}`}>
                    <div className="relative">
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
                        className="w-full rounded-lg"
                        />
                    )}
                    <button
                        type="button"
                        onClick={() => eliminarExistente(i)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                    >
                        ✕
                    </button>
                    </div>
                </SwiperSlide>
                ))}
                {/* Nuevas previews */}
                {previews.map((m, i) => (
                <SwiperSlide key={`new-${i}`}>
                    {m.type === "video" ? (
                    <video
                        src={m.url}
                        controls
                        className="w-full rounded-lg"
                    />
                    ) : (
                    <img
                        src={m.url}
                        alt="preview"
                        className="w-full rounded-lg"
                    />
                    )}
                </SwiperSlide>
                ))}
            </Swiper>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-4">
            <button
                type="button"
                onClick={() => navigate("/perfil")}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
                Cancelar
            </button>
            <button
                type="submit"
                disabled={!contenido.trim() && archivosNuevos.length === 0}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                (!contenido.trim() && archivosNuevos.length === 0)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
            >
                Guardar cambios
            </button>
            </div>
        </form>
        </div>
    );
    }
