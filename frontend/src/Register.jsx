import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
const [nombre, setNombre] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const navigate = useNavigate();

const API_URL = import.meta.env.VITE_API_URL;

const handleRegister = async (e) => {
    e.preventDefault();

    //VALIDACIONES
        if (!email.includes("@") || !email.includes(".")) {
            alert("Por favor, introduce un email válido.");
        return;
        }

        if (password.trim() === "") {
        alert("La contraseña no puede estar vacía.");
        return;
        }

    //Si todo es válido, enviamos al backend
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password })
        });

    const data = await res.json();
        if (res.ok) {
            alert("Usuario registrado exitosamente. Ahora puedes iniciar sesión.");
            navigate("/login");
    } else {
        alert(data.msg || "Error al registrar usuario");
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
