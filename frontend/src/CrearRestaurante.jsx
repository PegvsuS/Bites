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
        imagen: "",
        url_web: ""
    });

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const handleChange = (e) => {
        setFormData({ 
        ...formData, 
        [e.target.name]: e.target.value 
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, imagen: reader.result }); // guarda la imagen en base64
        };
        reader.readAsDataURL(file);
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const {
            nombre,
            tipo_cocina,
            localidad,
            direccion,
            precio_medio,
            imagen,
            url_web
        } = formData;
    
        // Validación de campos obligatorios
        if (!nombre || !tipo_cocina || !localidad || !direccion || !imagen) {
            toast.error("Todos los campos son obligatorios, incluida la imagen.");
        return;
        }
    
        // Validación de precio medio
        if (isNaN(precio_medio) || Number(precio_medio) <= 0) {
            toast.error("El precio medio debe ser un número positivo.");
        return;
        }
    
        // Validación de URL web
        const urlRegex = /^(https?:\/\/)([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/i;
        if (url_web && !urlRegex.test(url_web)) {
            toast.error("La URL del sitio web no es válida.");
        return;
        }
    
        // Validación del campo imagen (en base64 provisionalmente)
        if (!imagen.startsWith("data:image/")) {
            toast.error("La imagen debe ser un archivo válido.");
        return;
        }
    
        // Enviar al backend
        const res = await fetch(`${API_URL}/api/restaurantes/`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
            body: JSON.stringify(formData)
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
            <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
            />
            <input
            type="text"
            name="tipo_cocina"
            placeholder="Tipo de cocina"
            value={formData.tipo_cocina}
            onChange={handleChange}
            required
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
            />
            <input
            type="text"
            name="localidad"
            placeholder="Localidad"
            value={formData.localidad}
            onChange={handleChange}
            required
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
            />
            <input
            type="text"
            name="direccion"
            placeholder="Dirección"
            value={formData.direccion}
            onChange={handleChange}
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
            />
            <input
            type="number"
            name="precio_medio"
            placeholder="Precio medio (€)"
            value={formData.precio_medio}
            onChange={handleChange}
            required
            min={1}
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
            />
            <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
            />
            <input
            type="text"
            name="url_web"
            placeholder="Página web"
            value={formData.url_web}
            onChange={handleChange}
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
            />
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
