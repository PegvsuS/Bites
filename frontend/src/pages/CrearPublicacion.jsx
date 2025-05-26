    import { useState, useEffect } from "react";
    import { useNavigate } from "react-router-dom";
    import { toast } from "react-toastify";
    import { Swiper, SwiperSlide } from "swiper/react";
    import "swiper/css";

    export default function CrearPublicacion() {
    const [contenido, setContenido] = useState("");
    const [restauranteEtiquetado, setRestauranteEtiquetado] = useState("");
    const [archivos, setArchivos] = useState([]);
    const [previsualizaciones, setPrevisualizaciones] = useState([]);
    const [uploading, setUploading] = useState(false);

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    useEffect(() => {
        return () => {
        previsualizaciones.forEach((p) => URL.revokeObjectURL(p.url));
        };
    }, [previsualizaciones]);

    const handleArchivos = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + archivos.length > 10) {
        toast.error("Máximo 10 archivos por publicación");
        return;
        }

        const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/webm",
        ];
        const archivosValidos = files.filter((file) =>
        tiposPermitidos.includes(file.type)
        );
        if (archivosValidos.length !== files.length) {
        toast.error(
            "Algunos archivos no tienen formato válido (jpg, png, gif, mp4, webm)"
        );
        }

        setArchivos((prev) => [...prev, ...archivosValidos]);
        const previews = archivosValidos.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
        }));
        setPrevisualizaciones((prev) => [...prev, ...previews]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contenido.trim() && archivos.length === 0) {
        toast.error("La publicación no puede estar vacía");
        return;
        }

        const formData = new FormData();
        formData.append("contenido", contenido);
        formData.append("restaurante_etiquetado", restauranteEtiquetado.trim());
        archivos.forEach((file) => formData.append("media", file));

        setUploading(true);
        try {
        const res = await fetch(`${API_URL}/api/publicaciones/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const data = await res.json();
        if (res.ok) {
            toast.success("¡Publicación creada!");
            navigate("/perfil");
        } else {
            toast.error(data.msg || "Error al crear publicación");
        }
        } catch (err) {
        toast.error("Error de red");
        } finally {
        setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 space-y-6"
        >
            <h2 className="text-2xl font-semibold text-gray-800 text-center">
            Nueva publicación
            </h2>

            {/* 1 - Contenido */}
            <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="¿Qué quieres compartir?"
            className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            />

            {/* 2 - Restaurante etiquetado */}
            <input
            type="text"
            value={restauranteEtiquetado}
            onChange={(e) => setRestauranteEtiquetado(e.target.value)}
            placeholder="Etiqueta un restaurante (opcional)"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />

            {/* 3 - Zona de subida */}
            <div>
            <label className="block mb-2 text-gray-700 font-medium">
                Imágenes / Vídeos
            </label>
            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors">
                <input
                id="file-input"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleArchivos}
                disabled={uploading}
                className="hidden"
                />
                <label
                htmlFor="file-input"
                className="cursor-pointer text-purple-600 hover:text-purple-800"
                >
                Selecciona o arrastra tus archivos aquí
                </label>
            </div>
            </div>

            {/* 4 - Previsualizaciones */}
            {previsualizaciones.length > 0 && (
            <Swiper spaceBetween={10} slidesPerView={1} className="my-4">
                {previsualizaciones.map((file, idx) => (
                <SwiperSlide key={idx}>
                    {file.type === "video" ? (
                    <video
                        src={file.url}
                        controls
                        className="w-full rounded-lg"
                    />
                    ) : (
                    <img
                        src={file.url}
                        alt={`preview-${idx}`}
                        className="w-full object-cover rounded-lg"
                    />
                    )}
                </SwiperSlide>
                ))}
            </Swiper>
            )}

            {/* 5 - Botón Publicar */}
            <button
            type="submit"
            disabled={uploading || (!contenido.trim() && archivos.length === 0)}
            className={`w-full py-3 font-semibold text-white rounded-lg transition ${
                uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
            >
            {uploading ? "Publicando..." : "Publicar"}
            </button>
        </form>
        </div>
    );
    }
