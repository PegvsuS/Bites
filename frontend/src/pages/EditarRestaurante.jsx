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

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async e => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataImage = new FormData();
        formDataImage.append("imagen", file);

        setUploading(true);
        try {
        const res = await fetch(`${API_URL}/api/restaurantes/upload`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formDataImage
        });
        const data = await res.json();
        if (res.ok) {
            setFormData(prev => ({ ...prev, imagen: data.url }));
            toast.success("Imagen subida correctamente");
        } else {
            toast.error(data.msg || "Error al subir imagen");
        }
        } catch {
        toast.error("Error de conexión al subir imagen");
        } finally {
        setUploading(false);
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const payload = {
        nombre: formData.nombre,
        tipo_cocina: formData.tipo_cocina,
        localidad: formData.localidad,
        direccion: formData.direccion,
        precio_medio: formData.precio_medio,
        imagen: formData.imagen,
        url_web: formData.url_web
        };

        try {
        const res = await fetch(`${API_URL}/api/restaurantes/${id}`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 space-y-6"
        >
            <h2 className="text-2xl font-semibold text-gray-800 text-center">
            Editar Restaurante
            </h2>

            {/* Nombre */}
            <div>
            <label className="block text-gray-700 mb-1">Nombre *</label>
            <input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            </div>

            {/* Tipo de Cocina */}
            <div>
            <label className="block text-gray-700 mb-1">Tipo de cocina</label>
            <input
                name="tipo_cocina"
                value={formData.tipo_cocina}
                onChange={handleChange}
                placeholder="Tipo de cocina"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            </div>

            {/* Localidad y Dirección */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-gray-700 mb-1">Localidad</label>
                <input
                name="localidad"
                value={formData.localidad}
                onChange={handleChange}
                placeholder="Localidad"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
            </div>
            <div>
                <label className="block text-gray-700 mb-1">Dirección</label>
                <input
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Dirección"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
            </div>
            </div>

            {/* Precio Medio */}
            <div>
            <label className="block text-gray-700 mb-1">Precio medio (€)</label>
            <input
                type="number"
                name="precio_medio"
                value={formData.precio_medio}
                onChange={handleChange}
                placeholder="Precio medio"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            </div>

            {/* Subida de Imagen */}
            <div>
            <label className="block text-gray-700 mb-1">Imagen</label>
            <div className="flex items-center gap-4">
                <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                />
                <label
                htmlFor="file-input"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-gray-700 transition"
                >
                {uploading ? "Subiendo..." : "Cambiar imagen"}
                </label>
                {formData.imagen && (
                <img
                    src={`${API_URL}${formData.imagen}`}
                    alt="Vista previa"
                    className="h-16 w-16 object-cover rounded-md border border-gray-200"
                />
                )}
            </div>
            </div>

            {/* URL Web */}
            <div>
            <label className="block text-gray-700 mb-1">Sitio web (opcional)</label>
            <input
                name="url_web"
                value={formData.url_web || ""}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4">
            <button
                type="button"
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
                Cancelar
            </button>
            <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
                Guardar cambios
            </button>
            </div>
        </form>
        </div>
    );
    }

    export default EditarRestaurante;
