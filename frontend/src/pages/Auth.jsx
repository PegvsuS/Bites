    import { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { toast, ToastContainer } from "react-toastify";
    import 'react-toastify/dist/ReactToastify.css';
    import fondo from '../assets/fondo.png';

    export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ nombre: "", email: "", password: "" });
    const navigate = useNavigate();
    const API = import.meta.env.VITE_API_URL;

    const handleChange = e =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();

        // validaciones
        if (!form.email.includes("@") || !form.email.includes(".")) {
        return toast.error("Introduce un email válido.");
        }
        if (!form.password.trim()) {
        return toast.error("La contraseña no puede estar vacía.");
        }
        if (!isLogin && !form.nombre.trim()) {
        return toast.error("El nombre es obligatorio.");
        }

        // endpoint y payload
        const endpoint = isLogin ? "auth/login" : "auth/register";
        const payload = isLogin
        ? { email: form.email, password: form.password }
        : { nombre: form.nombre, email: form.email, password: form.password };

        try {
        const res = await fetch(`${API}/api/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Error en el servidor");

        if (isLogin) {
            localStorage.setItem("token", data.token);
            toast.success("¡Sesión iniciada!");
            return navigate("/");
        } else {
            toast.success("¡Registro exitoso! Ahora inicia sesión.");
            setIsLogin(true);
            setForm({ nombre: "", email: "", password: "" });
        }
        } catch (err) {
        toast.error(err.message);
        }
    };

    return (
        <>
        <ToastContainer position="top-center" />
        <div
        className="min-h-screen flex items-center justify-center"
        style={{
            backgroundImage: `url(${fondo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            }}
        >
            <div className="bg-white bg-opacity-50 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8">
            {/* Pestañas */}
            <div className="flex justify-center mb-6 space-x-4">
                <button
                className={
                    "py-2 px-6 rounded-full transition " +
                    (isLogin
                    ? "bg-white bg-opacity-80 text-purple-900 font-bold"
                    : "text-purple-500 hover:text-white/80")
                }
                onClick={() => setIsLogin(true)}
                >
                Login
                </button>
                <button
                className={
                    "py-2 px-6 rounded-full transition " +
                    (!isLogin
                    ? "bg-white bg-opacity-80 text-purple-900 font-bold"
                    : "text-purple-500 hover:text-white/80")
                }
                onClick={() => setIsLogin(false)}
                >
                Register
                </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Nombre"
                    className="w-full p-3 rounded-xl bg-gray-400 bg-opacity-60 placeholder-purple-700 focus:bg-opacity-80 outline-none"
                />
                )}
                <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 rounded-xl bg-gray-300 bg-opacity-70 placeholder-purple-700 focus:bg-opacity-80 outline-none"
                />
                <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Contraseña"
                className="w-full p-3 rounded-xl bg-gray-400 bg-opacity-80 placeholder-purple-700 focus:bg-opacity-80 outline-none"
                />

                <button
                type="submit"
                className="w-full mt-4 py-3 bg-white bg-opacity-80 text-purple-700 font-semibold rounded-xl hover:bg-opacity-100 transition"
                >
                {isLogin ? "Entrar" : "Registrarse"}
                </button>
            </form>
            </div>
        </div>
        </>
    );
    }
