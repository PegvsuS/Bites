import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
const [nombre, setNombre] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const navigate = useNavigate();

const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, password })
    });
    const data = await res.json();
    if (res.ok) {
    alert("Usuario registrado");
    navigate("/login");
    } else {
    alert(data.msg || "Error al registrarse");
    }
};

return (
    <form onSubmit={handleRegister} style={{ padding: "2rem" }}>
    <h2>Crear cuenta</h2>
    <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
    <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
    <button type="submit">Registrarse</button>
    </form>
);
}

export default Register;
