    import { useState } from "react";
    import { toast } from "react-toastify";

    function CrearPublicacion() {
    const [contenido, setContenido] = useState("");
    const [etiqueta, setEtiqueta] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    // ✅ TEST de headers separado y accesible
    const testHeaders = async () => {
        const token = localStorage.getItem("token");

        try {
        const res = await fetch("/api/publicaciones", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
            contenido: "Test desde testHeaders",
            etiqueta_restaurante: "Prueba",
            }),
        });

        const data = await res.json();
        console.log("🟢 testHeaders result:", res.status, data);
        } catch (err) {
        console.error("🔴 testHeaders error:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!contenido.trim()) {
        toast.warn("El contenido no puede estar vacío");
        return;
        }

        console.log("TOKEN:", token);
        console.log("Contenido:", contenido);
        console.log("Etiqueta:", etiqueta);

        // 🔁 TEMPORAL: Ejecutar solo el test
        await testHeaders();
        return; // ⛔ Detiene aquí para hacer solo la prueba por ahora

        // try {
        //   // const res = await fetch(`${API_URL}/api/publicaciones`, { Este es el correcto pero no funciona, por eso lo cambiamos a local.
        //   const res = await fetch("/api/publicaciones", {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //       Authorization: `Bearer ${token}`,
        //     },
        //     body: JSON.stringify({
        //       contenido,
        //       etiqueta_restaurante: etiqueta || null,
        //     }),
        //     credentials: "include",
        //   });

        //   if (!res.ok) {
        //     throw new Error("Error al crear la publicación");
        //   }

        //   setContenido("");
        //   setEtiqueta("");
        //   toast.success("Publicación creada correctamente");
        // } catch (err) {
        //   toast.error(err.message);
        // }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
        <h2>Crear nueva publicación</h2>
        <form onSubmit={handleSubmit}>
            <textarea
            placeholder="¿Qué quieres compartir?"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            rows={5}
            style={{ width: "100%", marginBottom: "1rem" }}
            />
            <input
            type="text"
            placeholder="Etiqueta de restaurante (opcional)"
            value={etiqueta}
            onChange={(e) => setEtiqueta(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem" }}
            />
            <button type="submit">Publicar</button>
        </form>
        </div>
    );
    }

    export default CrearPublicacion;
