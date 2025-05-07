import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


function Register() {
    const navigate = useNavigate();
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const API_URL = import.meta.env.VITE_API_URL;

    const handleRegister = async (e) => {
        e.preventDefault();
    
        // Validaciones
        if (!email.includes("@") || !email.includes(".")) {
            toast.error("Por favor, introduce un email válido.");
            return;
        }
    
        if (password.trim() === "") {
            toast.error("La contraseña no puede estar vacía.");
            return;
        }
    
        // Fetch al backend
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password })
        });
    
        const data = await res.json();
        if (res.ok) {
            toast.success("¡Usuario registrado exitosamente!");
    
            navigate("/login");
        } else {
            toast.error(data.msg || "Error al registrar usuario");
        }
    };


    return (
        <div style={{ padding: "2rem" }}>
        <h2>Registro</h2>

    
        <form onSubmit={handleRegister}>
            <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={{ display: "block", marginBottom: "1rem", width: "100%" }}
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ display: "block", marginBottom: "1rem", width: "100%" }}
                required
            />
            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ display: "block", marginBottom: "1rem", width: "100%" }}
                required
            />
            <button type="submit">Registrarse</button>
        </form>
    </div>
    );
}

export default Register;
