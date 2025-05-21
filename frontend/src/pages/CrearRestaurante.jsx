    import { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { toast } from "react-toastify";

    function CrearRestaurante() {
    const [formData, setFormData] = useState({
        nombre: "",
        tipo_cocina: "",
        localidad: "",
        direccion: "",
        precio_medio: "",
        imagen: null,
        url_web: ""
    });

    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
        }));
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
        const { nombre, tipo_cocina, localidad, direccion, precio_medio, imagen } = formData;

        if (!nombre || !tipo_cocina || !localidad || !direccion || !imagen) {
        toast.error("Todos los campos son obligatorios, incluida la imagen.");
        return;
        }

        const precio = parseFloat(precio_medio);
        if (isNaN(precio) || precio <= 0) {
        toast.error("El precio medio debe ser un número positivo.");
        return;
        }

        const res = await fetch(`${API_URL}/api/restaurantes/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, precio_medio: precio })
        });

        const data = await res.json();
        if (res.ok) {
        toast.success("¡Restaurante creado con éxito!");
        navigate("/");
        } else {
        toast.error(data.msg || "Error al crear restaurante");
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
        <h2>Añadir nuevo restaurante</h2>
        <form onSubmit={handleSubmit}>
            <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
            <input name="tipo_cocina" placeholder="Tipo de cocina" value={formData.tipo_cocina} onChange={handleChange} required />
            <input name="localidad" placeholder="Localidad" value={formData.localidad} onChange={handleChange} required />
            <input name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} required />
            <input
            type="number"
            name="precio_medio"
            placeholder="Precio medio (€)"
            value={formData.precio_medio}
            onChange={handleChange}
            required
            min={1}
            />

            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {uploading && <p>Subiendo imagen...</p>}
            {formData.imagen && (
            <div style={{ marginTop: "1rem" }}>
                <img src={`${API_URL}${formData.imagen}`} alt="Vista previa" style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }} />
            </div>
            )}

            <input name="url_web" placeholder="Página web (opcional)" value={formData.url_web} onChange={handleChange} />

            <button type="submit">Guardar restaurante</button>
            <button
            type="button"
            onClick={() => navigate("/")}
            style={{
                marginLeft: "1rem",
                backgroundColor: "#ddd",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer"
            }}
            >
            Cancelar
            </button>
        </form>
        </div>
    );
    }

    export default CrearRestaurante;
