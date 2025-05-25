    import { useNavigate, useLocation } from "react-router-dom";

    function BotonCrearPublicacion() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");

    // Ocultamos en login o registro
    const ocultar = ["/login", "/register"].includes(location.pathname);

    if (!token || ocultar) return null;

    return (
        <button
        onClick={() => navigate("/crear-publicacion")}
        style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "0.75rem 1.2rem",
            borderRadius: "9999px",
            fontSize: "1.5rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            cursor: "pointer",
            zIndex: 1000
        }}
        >
        ➕
        </button>
    );
    }

    export default BotonCrearPublicacion;
