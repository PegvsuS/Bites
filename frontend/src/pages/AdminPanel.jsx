    import { useEffect, useState } from "react";
    import { toast } from "react-toastify";
    import Swal from "sweetalert2";

    function AdminPanel() {
    const [usuarios, setUsuarios] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${API_URL}/api/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
            setUsuarios(data);
            } else {
            toast.error(data.msg || "Error al obtener usuarios");
            }
        })
        .catch(() => toast.error("Error de red al cargar usuarios"));
    }, []);

    const cambiarRol = async (id, rolActual) => {
        const { value: nuevoRol } = await Swal.fire({
        title: "Cambiar rol",
        input: "select",
        inputOptions: {
            user: "Usuario",
            moderador: "Moderador",
            admin: "Administrador"
        },
        inputValue: rolActual,
        showCancelButton: true,
        confirmButtonText: "Actualizar"
        });

        if (!nuevoRol || nuevoRol === rolActual) return;

        try {
        const res = await fetch(`${API_URL}/api/admin/usuarios/${id}/rol`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ rol: nuevoRol })
        });

        const data = await res.json();
        if (res.ok) {
            toast.success("Rol actualizado");
            setUsuarios(prev =>
            prev.map(u => (u.id === id ? { ...u, role: nuevoRol } : u))
            );
        } else {
            toast.error(data.msg || "Error al actualizar rol");
        }
        } catch {
        toast.error("Error de red");
        }
    };

    const eliminarUsuario = async (id) => {
        const confirm = await Swal.fire({
        title: "¿Eliminar usuario?",
        text: "Esta acción es irreversible",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
        });

        if (!confirm.isConfirmed) return;

        try {
        const res = await fetch(`${API_URL}/api/admin/usuarios/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (res.ok) {
            toast.success("Usuario eliminado");
            setUsuarios(prev => prev.filter(u => u.id !== id));
        } else {
            toast.error(data.msg || "Error al eliminar usuario");
        }
        } catch {
        toast.error("Error de red");
        }
    };

    return (
        <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
        <h2>Panel de Administración</h2>
        <h3>Usuarios registrados</h3>

        {usuarios.length === 0 ? (
            <p>No hay usuarios.</p>
        ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
            {usuarios.map(u => (
                <li key={u.id} style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
                }}>
                <div>
                    <p><strong>{u.nombre}</strong> — {u.email}</p>
                    <p>Rol: {u.role}</p>
                </div>
                <div>
                    <button onClick={() => cambiarRol(u.id, u.role)} style={{ marginRight: "0.5rem" }}>
                    Cambiar rol
                    </button>
                    <button onClick={() => eliminarUsuario(u.id)} style={{ backgroundColor: "red", color: "white" }}>
                    Eliminar
                    </button>
                </div>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
    }

    export default AdminPanel;
