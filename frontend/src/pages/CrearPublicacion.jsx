    import { useState, useEffect } from "react";
    import { useNavigate } from "react-router-dom";
    import { toast } from "react-toastify";
    import { Swiper, SwiperSlide } from 'swiper/react';
    import 'swiper/css';

    function CrearPublicacion() {
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
        previsualizaciones.forEach(p => URL.revokeObjectURL(p.url));
        };
    }, [previsualizaciones]);

    const handleArchivos = (e) => {
        const files = Array.from(e.target.files);

        if (files.length + archivos.length > 10) {
        toast.error("Máximo 10 archivos por publicación");
        return;
        }

        const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];
        const archivosValidos = files.filter(file => tiposPermitidos.includes(file.type));

        if (archivosValidos.length !== files.length) {
        toast.error("Algunos archivos no tienen un formato válido (jpg, png, gif, mp4, webm)");
        }

        setArchivos(prev => [...prev, ...archivosValidos]);

        const previews = archivosValidos.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image"
        }));

        setPrevisualizaciones(prev => [...prev, ...previews]);
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
        archivos.forEach(file => {
        formData.append("media", file);
        });

        setUploading(true);
        try {
        const res = await fetch(`${API_URL}/api/publicaciones/`, {
            method: "POST",
            headers: {
            Authorization: `Bearer ${token}`
            },
            body: formData
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
        <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
        <h2>Crear publicación</h2>
        <form onSubmit={handleSubmit}>
            <textarea
            placeholder="¿Qué quieres compartir?"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            style={{ width: "100%", minHeight: "100px", marginBottom: "1rem" }}
            />

            <input
            type="text"
            value={restauranteEtiquetado}
            onChange={(e) => setRestauranteEtiquetado(e.target.value)}
            placeholder="Restaurante etiquetado (opcional)"
            style={{ width: "100%", marginBottom: "1rem" }}
            />

            <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleArchivos}
            disabled={uploading}
            />

            {previsualizaciones.length > 0 && (
            <Swiper spaceBetween={10} slidesPerView={1} style={{ marginTop: "1rem" }}>
                {previsualizaciones.map((file, index) => (
                <SwiperSlide key={index}>
                    {file.type === "video" ? (
                    <video src={file.url} controls style={{ width: "100%", borderRadius: "8px" }} />
                    ) : (
                    <img src={file.url} alt="preview" style={{ width: "100%", borderRadius: "8px" }} />
                    )}
                </SwiperSlide>
                ))}
            </Swiper>
            )}

            <button
            type="submit"
            disabled={uploading || (!contenido.trim() && archivos.length === 0)}
            style={{ marginTop: "1rem" }}
            >
            {uploading ? "Publicando..." : "Publicar"}
            </button>
        </form>
        </div>
    );
    }

    export default CrearPublicacion;
