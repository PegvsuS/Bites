import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const navigate = useNavigate();

const API_URL = import.meta.env.VITE_API_URL;

const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
    localStorage.setItem("token", data.token);
    navigate("/");
    } else {
    alert(data.msg || "Error al iniciar sesión");
    }
};

return (
    <form onSubmit={handleLogin} style={{ padding: "2rem" }}>
    <h2>Iniciar sesión</h2>
    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
    <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
    <button type="submit">Entrar</button>
    </form>
);
}

export default Login;
