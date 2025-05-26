    import { useNavigate, useLocation } from "react-router-dom";

    export default function BotonCrearPublicacion() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");

    // Ocultamos en login o register
    const ocultar = ["/login", "/register"].includes(location.pathname);
    if (!token || ocultar) return null;

    return (
        <button
        onClick={() => navigate("/crear-publicacion")}
        className="
            fixed 
            bottom-8 
            left-1/2 
            transform -translate-x-1/2
            bg-purple-600 hover:bg-purple-700 
            text-white 
            w-14 h-14 
            flex items-center justify-center 
            rounded-full 
            text-3xl 
            shadow-lg 
            transition 
            focus:outline-none focus:ring-2 focus:ring-purple-400
            z-50
        "
        aria-label="Crear publicación"
        >
        +
        </button>
    );
    }
