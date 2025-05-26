    import { useState, useEffect } from "react";
    import { toast } from "react-toastify";
    import { useNavigate } from "react-router-dom";
    import Swal from 'sweetalert2';

    function ConfiguracionUsuario() {
    const [pestana, setPestana] = useState("perfil");
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [contraseñaActual, setContraseñaActual] = useState("");
    const [nuevaContraseña, setNuevaContraseña] = useState("");
    const [rol, setRol] = useState("");

    const token = localStorage.getItem("token");
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const cargarDatosUsuario = async () => {
        try {
            const res = await fetch(`${API_URL}/api/usuarios/perfil`, {
            headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
            setNombre(data.nombre);
            setEmail(data.email);
            setRol(data.role);
            } else {
            toast.error(data.msg || "Error al cargar usuario");
            }
        } catch {
            toast.error("Error de red");
        }
        };

        cargarDatosUsuario();
    }, []);

    const actualizarPerfil = async () => {
        try {
        const res = await fetch(`${API_URL}/api/usuarios/actualizar-perfil`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ nombre, email })
        });

        const data = await res.json();
        if (res.ok) {
            toast.success("Perfil actualizado");
        } else {
            toast.error(data.msg || "Error al actualizar perfil");
        }
        } catch {
        toast.error("Error de red");
        }
    };

    const cambiarContrasena = async () => {
        try {
        const res = await fetch(`${API_URL}/api/usuarios/cambiar-contrasena`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
            actual: contraseñaActual,
            nueva: nuevaContraseña
            })
        });

        const data = await res.json();
        if (res.ok) {
            toast.success("Contraseña actualizada");
            setContraseñaActual("");
            setNuevaContraseña("");
        } else {
            toast.error(data.msg || "Error al cambiar contraseña");
        }
        } catch {
        toast.error("Error de red");
        }
    };

    const eliminarCuenta = async () => {
        const primerPaso = await Swal.fire({
        title: '¿Qué deseas hacer con tu cuenta?',
        text: '¿Quieres eliminar también los restaurantes que has creado o conservarlos?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Eliminar TODO',
        cancelButtonText: 'Conservar restaurantes',
        reverseButtons: true
        });

        if (!primerPaso.isConfirmed && primerPaso.dismiss !== Swal.DismissReason.cancel) return;

        const segundoPaso = await Swal.fire({
        title: '¿Estás completamente seguro?',
        text: primerPaso.isConfirmed
            ? 'Se eliminarán tu cuenta, publicaciones, reseñas y restaurantes.'
            : 'Se eliminarán tu cuenta, publicaciones y reseñas. Los restaurantes se conservarán.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
        });

        if (!segundoPaso.isConfirmed) return;

        const conservar_restaurantes = !primerPaso.isConfirmed;

        try {
        const res = await fetch(`${API_URL}/api/usuarios/eliminar`, {
            method: "DELETE",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ conservar_restaurantes })
        });

        const data = await res.json();
        if (res.ok) {
            await Swal.fire("Cuenta eliminada", "Tu cuenta fue eliminada correctamente", "success");
            localStorage.removeItem("token");
            navigate("/");
        } else {
            Swal.fire("Error", data.msg || "No se pudo eliminar la cuenta", "error");
        }
        } catch {
        Swal.fire("Error", "Error de red al eliminar la cuenta", "error");
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem" }}>
        <h2>Configuración</h2>
        <div style={{ marginBottom: "1rem" }}>
            <button onClick={() => setPestana("perfil")} style={{ marginRight: "1rem" }}>
            Perfil de usuario
            </button>
            <button onClick={() => setPestana("seguridad")} style={{ marginRight: "1rem" }}>
            Seguridad
            </button>
            {rol === "admin" && (
            <button onClick={() => setPestana("admin")}>
                Administración
            </button>
            )}
        </div>

        {pestana === "perfil" && (
            <div>
            <h3>Actualizar perfil</h3>
            <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />
            <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={actualizarPerfil}>Guardar cambios</button>

            <h3 style={{ marginTop: "2rem" }}>Cambiar contraseña</h3>
            <input
                type="password"
                placeholder="Contraseña actual"
                value={contraseñaActual}
                onChange={(e) => setContraseñaActual(e.target.value)}
            />
            <input
                type="password"
                placeholder="Nueva contraseña"
                value={nuevaContraseña}
                onChange={(e) => setNuevaContraseña(e.target.value)}
            />
            <button onClick={cambiarContrasena}>Actualizar contraseña</button>
            </div>
        )}

        {pestana === "seguridad" && (
            <div>
            <h3>Eliminar cuenta</h3>
            <p style={{ color: "red" }}>
                Esta acción es irreversible. Se eliminarán tus datos y publicaciones.
            </p>
            <button onClick={eliminarCuenta} style={{ backgroundColor: "red", color: "white" }}>
                Eliminar mi cuenta
            </button>
            </div>
        )}

        {pestana === "admin" && rol === "admin" && (
            <div>
            <h3>Administración</h3>
            <p>Desde aquí puedes gestionar usuarios y contenido del sistema.</p>
            <button onClick={() => navigate("/admin")}>Ir al panel de administración</button>
            </div>
        )}
        </div>
    );
    }

    export default ConfiguracionUsuario;
