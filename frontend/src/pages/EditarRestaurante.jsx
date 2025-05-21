    import { useEffect, useState } from "react";
    import { useParams, useNavigate } from "react-router-dom";
    import { toast } from "react-toastify";

    function EditarRestaurante() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const API_URL = import.meta.env.VITE_API_URL;

    const [formData, setFormData] = useState({
        nombre: "",
        tipo_cocina: "",
        localidad: "",
        direccion: "",
        precio_medio: "",
        imagen: "",
        url_web: ""
    });

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const cargarRestaurante = async () => {
        try {
            const res = await fetch(`${API_URL}/api/restaurantes/${id}`);
            if (!res.ok) throw new Error("No se pudo cargar el restaurante");
            const data = await res.json();
            setFormData(data);
        } catch (err) {
            toast.error(err.message);
        }
        };

        cargarRestaurante();
    }, [id, API_URL]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataImage = new FormData();
        formDataImage.append("imagen", file);

        setUploading(true);
        try {
        const res = await fetch(`${API_URL}/api/restaurantes/upload`, {
            method: "POST",
            headers: {
            Authorization: `Bearer ${token}`
            },
            body: formDataImage
        });

        const data = await res.json();
        if (res.ok) {
            setFormData(prev => ({ ...prev, imagen: data.url }));
            toast.success("Imagen subida correctamente");
        } else {
            toast.error(data.msg || "Error al subir imagen");
        }
        } catch (err) {
        toast.error("Error de conexión al subir imagen");
        } finally {
        setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

         // Solo los campos válidos que se tienen que enviar al backend al actualizar el restaurante
        const dataParaEnviar = {
            nombre: formData.nombre,
            tipo_cocina: formData.tipo_cocina,
            localidad: formData.localidad,
            direccion: formData.direccion,
            precio_medio: formData.precio_medio,
            imagen: formData.imagen,
            url_web: formData.url_web
        };

          // 🔍 LOGS para depuración
        console.log("Token:", token);
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            console.log("userId desde token:", payload.sub || payload.id);
        } catch (err) {
            console.error("Error al decodificar token:", err);
        }
        console.log("Datos enviados al backend:", dataParaEnviar);

        try {
            const res = await fetch(`${API_URL}/api/restaurantes/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(dataParaEnviar)
            });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.msg || "Error al actualizar");
        }

        toast.success("Restaurante actualizado correctamente");
        navigate(`/restaurantes/${id}`);
        } catch (err) {
        toast.error(err.message);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
        <h2>Editar Restaurante</h2>
        <form onSubmit={handleSubmit}>
            <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required />
            <input name="tipo_cocina" value={formData.tipo_cocina} onChange={handleChange} placeholder="Tipo de cocina" />
            <input name="localidad" value={formData.localidad} onChange={handleChange} placeholder="Localidad" />
            <input name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección" />
            <input type="number" name="precio_medio" value={formData.precio_medio} onChange={handleChange} placeholder="Precio medio" />

            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {uploading && <p>Subiendo imagen...</p>}
            {formData.imagen && (
            <img src={`${API_URL}${formData.imagen}`} alt="Vista previa" style={{ maxWidth: "100%", marginTop: "1rem", borderRadius: "8px" }} />
            )}

            <input name="url_web" value={formData.url_web || ""} onChange={handleChange} placeholder="Sitio web (opcional)" />
            
            <button type="submit">Guardar cambios</button>
            <button type="button" onClick={() => navigate("/")} style={{ marginLeft: "1rem" }}>Cancelar</button>
        </form>
        </div>
    );
    }

    export default EditarRestaurante;
