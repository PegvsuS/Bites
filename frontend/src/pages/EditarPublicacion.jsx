    import { useEffect, useState } from "react";
    import { useParams, useNavigate } from "react-router-dom";
    import { toast } from "react-toastify";
    import { Swiper, SwiperSlide } from 'swiper/react';
    import 'swiper/css';

    function EditarPublicacion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const [contenido, setContenido] = useState("");
    const [restauranteEtiquetado, setRestauranteEtiquetado] = useState("");
    const [mediaExistente, setMediaExistente] = useState([]);
    const [mediaEliminada, setMediaEliminada] = useState([]);
    const [archivosNuevos, setArchivosNuevos] = useState([]);
    const [previsualizaciones, setPrevisualizaciones] = useState([]);

    useEffect(() => {
        const cargarPublicacion = async () => {
        try {
            const res = await fetch(`${API_URL}/api/publicaciones/${id}`);
            const data = await res.json();
            if (res.ok) {
            setContenido(data.contenido);
            setRestauranteEtiquetado(data.restaurante_etiquetado || "");
            setMediaExistente(data.media || []);
            } else {
            toast.error(data.msg || "Error al cargar publicación");
            }
        } catch {
            toast.error("Error de red");
        }
        };
        cargarPublicacion();
    }, [id]);

    const handleArchivos = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];

        for (let file of files) {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if (!(isImage || isVideo)) {
            toast.error(`Archivo no permitido: ${file.name}`);
            continue;
        }
        validFiles.push(file);
        }

        if (validFiles.length + mediaExistente.length + archivosNuevos.length > 10) {
        toast.error("Máximo 10 archivos por publicación");
        return;
        }

        setArchivosNuevos(prev => [...prev, ...validFiles]);

        const previews = validFiles.map(file => {
        const url = URL.createObjectURL(file);
        return {
            url,
            type: file.type.startsWith("video") ? "video" : "image"
        };
        });

        setPrevisualizaciones(prev => [...prev, ...previews]);
    };

    useEffect(() => {
        return () => {
        previsualizaciones.forEach(pre => URL.revokeObjectURL(pre.url));
        };
    }, [previsualizaciones]);

    const eliminarMediaExistente = (index) => {
        const media = mediaExistente[index];
        setMediaEliminada(prev => [...prev, media.id]);
        const actualizada = [...mediaExistente];
        actualizada.splice(index, 1);
        setMediaExistente(actualizada);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("contenido", contenido);
        formData.append("restaurante_etiquetado", restauranteEtiquetado);
        archivosNuevos.forEach(file => formData.append("media", file));
        mediaEliminada.forEach(id => formData.append("media_eliminada", id));

        try {
        const res = await fetch(`${API_URL}/api/publicaciones/${id}`, {
            method: "PUT",
            headers: {
            Authorization: `Bearer ${token}`
            },
            body: formData
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
        <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
        <h2>Editar publicación</h2>
        <form onSubmit={handleSubmit}>
            <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Contenido"
            style={{ width: "100%", minHeight: "100px", marginBottom: "1rem" }}
            />

            <input
            type="text"
            value={restauranteEtiquetado}
            onChange={(e) => setRestauranteEtiquetado(e.target.value)}
            placeholder="Restaurante etiquetado (opcional)"
            style={{ width: "100%", marginBottom: "1rem" }}
            />

            <input type="file" accept="image/*,video/*" multiple onChange={handleArchivos} />

            {(mediaExistente.length > 0 || previsualizaciones.length > 0) && (
            <Swiper slidesPerView={1} spaceBetween={10}>
                {mediaExistente.map((m, i) => (
                <SwiperSlide key={`existente-${i}`}>
                    <div style={{ position: "relative" }}>
                    {m.tipo === "video" ? (
                        <video src={`${API_URL}${m.url}`} controls style={{ width: "100%" }} />
                    ) : (
                        <img src={`${API_URL}${m.url}`} alt="media" style={{ width: "100%" }} />
                    )}
                    <button
                        type="button"
                        onClick={() => eliminarMediaExistente(i)}
                        style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "rgba(255, 0, 0, 0.8)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        padding: "0.5rem",
                        cursor: "pointer",
                        fontSize: "1rem",
                        }}
                    >
                        ✕
                    </button>
                    </div>
                </SwiperSlide>
                ))}

                {previsualizaciones.map((m, i) => (
                <SwiperSlide key={`preview-${i}`}>
                    {m.type === "video" ? (
                    <video src={m.url} controls style={{ width: "100%" }} />
                    ) : (
                    <img src={m.url} alt="preview" style={{ width: "100%" }} />
                    )}
                </SwiperSlide>
                ))}
            </Swiper>
            )}

            <button
            type="submit"
            disabled={!contenido.trim() && archivosNuevos.length === 0}
            style={{ marginTop: "1rem" }}
            >
            Guardar cambios
            </button>
        </form>
        </div>
    );
    }

    export default EditarPublicacion;
