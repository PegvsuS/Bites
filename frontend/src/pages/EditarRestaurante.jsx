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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
        const res = await fetch(`${API_URL}/api/restaurantes/${id}`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.msg || "Error al actualizar");
        }

        toast.success("Restaurante actualizado correctamente");
        navigate("/");
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
            <input name="precio_medio" type="number" value={formData.precio_medio} onChange={handleChange} placeholder="Precio medio" />
            <input name="imagen" value={formData.imagen} onChange={handleChange} placeholder="URL de la imagen" />
            <input name="url_web" value={formData.url_web || ""} onChange={handleChange} placeholder="Sitio web (opcional)" />
            <button type="submit">Guardar cambios</button>
        </form>
        </div>
    );
    }

    export default EditarRestaurante;
