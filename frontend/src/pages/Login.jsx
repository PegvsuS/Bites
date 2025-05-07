import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const API_URL = import.meta.env.VITE_API_URL;

    const handleLogin = async (e) => {
        e.preventDefault();
    
        if (!email.includes("@") || !email.includes(".")) {
            toast.error("Por favor, introduce un email válido.");
            return;
        }
    
        if (password.trim() === "") {
            toast.error("La contraseña no puede estar vacía.");
            return;
        }
    
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
    
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user_id", data.usuario.id);
            localStorage.setItem("nombre", data.usuario.nombre);
            localStorage.setItem("email", data.usuario.email);
    
            toast.success("¡Has iniciado sesión con éxito!");
            navigate("/");
        } else {
            toast.error(data.msg || "Error al iniciar sesión");
        }
    };
    

    return (
        <div style={{ padding: "2rem" }}>
        <h2>Iniciar sesión</h2>

        <form onSubmit={handleLogin}>
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
            <button type="submit">Entrar</button>
        </form>
        </div>
    );
}

export default Login;
