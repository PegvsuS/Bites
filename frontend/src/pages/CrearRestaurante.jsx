
    import { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { toast } from "react-toastify";

    export default function CrearRestaurante() {
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
            headers: { Authorization: `Bearer ${token}` },
            body: formDataImage
        });
        const data = await res.json();
        if (res.ok) {
            setFormData(prev => ({ ...prev, imagen: data.url }));
            toast.success("✅ Imagen subida correctamente");
        } else {
            toast.error(data.msg || "❌ Error al subir imagen");
        }
        } catch {
        toast.error("❌ Error de conexión al subir imagen");
        } finally {
        setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { nombre, tipo_cocina, localidad, direccion, precio_medio, imagen } = formData;
        if (!nombre || !tipo_cocina || !localidad || !direccion || !imagen) {
        toast.error("Todos los campos son obligatorios (incluida la imagen)");
        return;
        }
        const precio = parseFloat(precio_medio);
        if (isNaN(precio) || precio <= 0) {
        toast.error("El precio medio debe ser un número positivo");
        return;
        }

        try {
        const res = await fetch(`${API_URL}/api/restaurantes/`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ ...formData, precio_medio: precio })
        });
        const data = await res.json();
        if (res.ok) {
            toast.success("🎉 Restaurante creado con éxito");
            navigate("/");
        } else {
            toast.error(data.msg || "❌ Error al crear restaurante");
        }
        } catch {
        toast.error("❌ Error de red al crear restaurante");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 space-y-6"
        >
            <h2 className="text-2xl font-bold text-gray-800 text-center">
            ➕ Añadir Nuevo Restaurante
            </h2>

            {/* Nombre */}
            <div>
            <label className="block mb-2 text-gray-700 font-medium">Nombre</label>
            <input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. La Terraza"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
            />
            </div>

            {/* Tipo de cocina */}
            <div>
            <label className="block mb-2 text-gray-700 font-medium">Tipo de cocina</label>
            <input
                name="tipo_cocina"
                value={formData.tipo_cocina}
                onChange={handleChange}
                placeholder="Ej. Italiana"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
            />
            </div>

            {/* Localidad y Dirección */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block mb-2 text-gray-700 font-medium">Localidad</label>
                <input
                name="localidad"
                value={formData.localidad}
                onChange={handleChange}
                placeholder="Ciudad o barrio"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
                />
            </div>
            <div>
                <label className="block mb-2 text-gray-700 font-medium">Dirección</label>
                <input
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Calle, número..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
                />
            </div>
            </div>

            {/* Precio medio */}
            <div>
            <label className="block mb-2 text-gray-700 font-medium">Precio medio (€)</label>
            <input
                type="number"
                name="precio_medio"
                value={formData.precio_medio}
                onChange={handleChange}
                placeholder="Ej. 25"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
            />
            </div>

            {/* Subida de imagen */}
            <div>
            <label className="block mb-2 text-gray-700 font-medium">Imagen principal</label>
            <div className="relative">
                <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-purple-400 transition-colors">
                {uploading
                    ? "🔄 Subiendo..."
                    : formData.imagen
                    ? "✅ Imagen cargada"
                    : "Click o arrastra tu imagen aquí"}
                </div>
            </div>
            {formData.imagen && (
                <img
                src={`${API_URL}${formData.imagen}`}
                alt="Vista previa"
                className="mt-4 w-full h-48 object-cover rounded-lg shadow-md"
                />
            )}
            </div>

            {/* Url Web */}
            <div>
            <label className="block mb-2 text-gray-700 font-medium">Página web (opcional)</label>
            <input
                name="url_web"
                value={formData.url_web}
                onChange={handleChange}
                placeholder="https://midominio.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            </div>

            {/* Botones */}
            <div className="flex justify-between items-center mt-6">
            <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
                Cancelar
            </button>
            <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
            >
                Guardar
            </button>
            </div>
        </form>
        </div>
    );
    }
