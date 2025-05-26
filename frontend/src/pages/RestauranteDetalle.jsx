    import { ToastContainer, toast } from "react-toastify";
    import "react-toastify/dist/ReactToastify.css";
    import { useParams, useNavigate, Link } from "react-router-dom";
    import { useEffect, useState } from "react";
    import { FaCheckCircle } from "react-icons/fa";
    import Comentarios from "../Comentarios";

    export default function RestauranteDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurante, setRestaurante] = useState(null);
    const [resenas, setResenas] = useState([]);
    const [comentario, setComentario] = useState("");
    const [valoracion, setValoracion] = useState(5);
    const [hoverValoracion, setHoverValoracion] = useState(0);
    const [editandoResenaId, setEditandoResenaId] = useState(null);
    const [comentarioEditado, setComentarioEditado] = useState("");
    const [valoracionEditada, setValoracionEditada] = useState(5);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;

    // Extraer userId del token
    let userId = null;
    if (token) {
        try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.sub || payload.id;
        } catch {}
    }

    // Carga de datos
    useEffect(() => {
        fetch(`${API_URL}/api/restaurantes/${id}`)
        .then(res => res.json())
        .then(data => setRestaurante(data));

        fetch(`${API_URL}/api/resenas/restaurante/${id}`)
        .then(res => res.json())
        .then(data => setResenas(data));
    }, [id]);

    // Enviar nueva reseña
    const handleSubmitResena = async e => {
        e.preventDefault();
        if (comentario.trim().length < 10) {
        return toast.error("El comentario debe tener al menos 10 caracteres.");
        }
        if (valoracion < 1 || valoracion > 5) {
        return toast.error("La valoración debe estar entre 1 y 5.");
        }

        try {
        const res = await fetch(`${API_URL}/api/resenas/`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
            restaurante_id: restaurante.id,
            comentario,
            valoracion,
            }),
        });
        const data = await res.json();
        if (res.ok) {
            setComentario("");
            setValoracion(5);
            const updated = await fetch(
            `${API_URL}/api/resenas/restaurante/${id}`
            ).then(res => res.json());
            setResenas(updated);
            toast.success("¡Reseña publicada!");
        } else {
            toast.error(data.msg || "Error al enviar reseña");
        }
        } catch {
        toast.error("Error de red");
        }
    };

    // Eliminar reseña
    const handleDeleteResena = async resenaId => {
        if (!window.confirm("¿Eliminar esta reseña?")) return;
        const res = await fetch(`${API_URL}/api/resenas/${resenaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
        setResenas(resenas.filter(r => r.id !== resenaId));
        toast.success("Reseña eliminada");
        } else {
        toast.error("Error al eliminar");
        }
    };

    // Actualizar reseña
    const handleUpdateResena = async e => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/api/resenas/${editandoResenaId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            comentario: comentarioEditado,
            valoracion: valoracionEditada,
        }),
        });
        if (res.ok) {
        const updated = await res.json();
        setResenas(resenas.map(r =>
            r.id === editandoResenaId
            ? { ...r, comentario: updated.comentario, valoracion: updated.valoracion }
            : r
        ));
        setEditandoResenaId(null);
        setComentarioEditado("");
        setValoracionEditada(5);
        toast.success("Reseña actualizada");
        } else {
        toast.error("Error al actualizar reseña");
        }
    };

    if (!restaurante) {
        return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-gray-600">Cargando...</p>
        </div>
        );
    }

    const esCreador = isAuthenticated && Number(restaurante.creador_id) === Number(userId);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
        <ToastContainer />
        <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        >
            ⬅️ Volver
        </button>

        {esCreador && (
            <div className="flex gap-4">
            <button
                onClick={() => navigate(`/restaurantes/${restaurante.id}/editar`)}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg"
            >
                Editar
            </button>
            <button
                onClick={async () => {
                if (!window.confirm("¿Eliminar restaurante?")) return;
                const res = await fetch(`${API_URL}/api/restaurantes/${restaurante.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) navigate("/", { replace: true, state: { mensaje: "eliminado" } });
                else toast.error("Error al eliminar");
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
                Eliminar
            </button>
            </div>
        )}

        <div className="space-y-4">
            <h1 className="text-3xl font-bold">{restaurante.nombre}</h1>
            <img
            src={`${API_URL}${restaurante.imagen}`}
            alt={restaurante.nombre}
            className="w-full h-64 object-cover rounded-lg shadow"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <p><strong>Cocina:</strong> {restaurante.tipo_cocina}</p>
            <p><strong>Dirección:</strong> {restaurante.direccion}</p>
            <p><strong>Precio medio:</strong> €{restaurante.precio_medio}</p>
            {restaurante.url_web && (
                <p>
                <strong>Web:</strong>{" "}
                <a
                    href={restaurante.url_web}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    {restaurante.url_web}
                </a>
                </p>
            )}
            </div>
        </div>

        {isAuthenticated && (
            <form
            onSubmit={handleSubmitResena}
            className="bg-white p-6 rounded-2xl shadow space-y-4"
            >
            <h2 className="text-2xl font-semibold">Escribe tu reseña</h2>
            <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="¿Qué te pareció?"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
            />
            <div className="flex items-center gap-2">
                <span className="font-medium">Valoración:</span>
                {[1,2,3,4,5].map(n => (
                <span
                    key={n}
                    onClick={() => setValoracion(n)}
                    onMouseEnter={() => setHoverValoracion(n)}
                    onMouseLeave={() => setHoverValoracion(0)}
                    className={`cursor-pointer text-2xl ${
                    (hoverValoracion||valoracion) >= n ? "text-yellow-400" : "text-gray-300"
                    }`}
                >
                    ★
                </span>
                ))}
            </div>
            <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
                Enviar reseña
            </button>
            </form>
        )}

        <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Reseñas</h2>
            {resenas.length === 0 ? (
            <p className="text-gray-600">Aún no hay reseñas.</p>
            ) : (
            resenas.map(r => (
                <div
                key={r.id}
                className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-2"
                >
                <div className="flex items-center justify-between">
                    <Link
                    to={`/usuarios/${r.usuario_id}`}
                    className="font-medium text-blue-600 hover:underline"
                    >
                    {r.usuario}
                    </Link>
                    <span className="text-yellow-400">
                    {"★".repeat(r.valoracion)}{" "}
                    <span className="text-gray-400">/5</span>
                    </span>
                </div>

                {editandoResenaId === r.id ? (
                    <form onSubmit={handleUpdateResena} className="space-y-2">
                    <textarea
                        value={comentarioEditado}
                        onChange={e => setComentarioEditado(e.target.value)}
                        className="w-full p-3 border rounded-lg"
                    />
                    <div className="flex items-center gap-2">
                        {[1,2,3,4,5].map(n => (
                        <span
                            key={n}
                            onClick={() => setValoracionEditada(n)}
                            className={`cursor-pointer text-2xl ${
                            n <= valoracionEditada ? "text-yellow-400" : "text-gray-300"
                            }`}
                        >
                            ★
                        </span>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button className="px-4 py-1 bg-green-400 hover:bg-green-500 rounded-lg">
                        Guardar
                        </button>
                        <button
                        type="button"
                        onClick={() => setEditandoResenaId(null)}
                        className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg"
                        >
                        Cancelar
                        </button>
                    </div>
                    </form>
                ) : (
                    <>
                    <p className="text-gray-700">{r.comentario}</p>
                    <p className="text-sm text-gray-500">{r.fecha}</p>
                    {isAuthenticated && Number(userId) === r.usuario_id && (
                        <div className="flex gap-2">
                        <button
                            onClick={() => {
                            setEditandoResenaId(r.id);
                            setComentarioEditado(r.comentario);
                            setValoracionEditada(r.valoracion);
                            }}
                            className="px-3 py-1 bg-yellow-300 hover:bg-yellow-400 rounded-lg"
                        >
                            Editar
                        </button>
                        <button
                            onClick={() => handleDeleteResena(r.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                        >
                            Eliminar
                        </button>
                        </div>
                    )}
                    </>
                )}

                <Comentarios resenaId={r.id} />
                </div>
            ))
            )}
        </section>
        </div>
    );
    }
