    import { useState } from "react";
    import { useNavigate } from "react-router-dom";

    function BuscadorUsuarios() {
    const [termino, setTermino] = useState("");
    const [resultados, setResultados] = useState([]);
    const [mostrarResultados, setMostrarResultados] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const buscarUsuarios = async (texto) => {
        if (!texto.trim()) {
        setResultados([]);
        return;
        }

        try {
        const res = await fetch(`${API_URL}/api/usuarios/buscar?q=${texto}`, {
            headers: {
            "Authorization": `Bearer ${token}`
            }
        });
        const data = await res.json();
        setResultados(data);
        setMostrarResultados(true);
        } catch (err) {
        console.error("Error al buscar usuarios", err);
        }
    };

    const handleSeleccion = (usuarioId) => {
        navigate(`/usuarios/${usuarioId}`);
        setMostrarResultados(false);
        setTermino("");
    };

    return (
        <div style={{ marginBottom: "1rem", position: "relative", maxWidth: "300px" }}>
        <input
            type="text"
            placeholder="Buscar usuarios..."
            value={termino}
            onChange={(e) => {
            setTermino(e.target.value);
            buscarUsuarios(e.target.value);
            }}
            style={{ width: "100%", padding: "0.5rem" }}
        />
        {mostrarResultados && resultados.length > 0 && (
            <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            position: "absolute",
            width: "100%",
            zIndex: 1000
            }}>
            {resultados.map(u => (
                <li key={u.id}
                    onClick={() => handleSeleccion(u.id)}
                    style={{ padding: "0.5rem", cursor: "pointer", borderBottom: "1px solid #eee" }}
                >
                {u.nombre} <span style={{ color: "#666", fontSize: "0.85rem" }}>({u.email})</span>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
    }

    export default BuscadorUsuarios;
