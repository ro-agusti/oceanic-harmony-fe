import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Menu, X } from "lucide-react";

interface NavProps {
  title?: string;
}

export default function Nav({ title = "Oceanic Harmony" }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full max-w-screen-lg mx-auto left-0 right-0 flex justify-between p-4 border-b border-gray-300 bg-[#f8f1e8] z-50">
      <h1 className="text-2xl font-bold text-gray-700 font-mono">{title}</h1>

      {/* Botones desktop */}
      <div className="hidden md:flex gap-4">
        <button
          className="flex items-center gap-2 text-gray-500 hover:underline"
          onClick={() => navigate("/login")}
        >
          <LogIn size={20} /> Log In
        </button>
        <button
          className="flex items-center gap-2 text-gray-500 hover:underline"
          onClick={() => navigate("/signup")}
        >
          <UserPlus size={20} /> Sign Up
        </button>
      </div>

      {/* Menú hamburguesa mobile */}
      <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Menú desplegable mobile */}
      {menuOpen && (
        <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 flex flex-col gap-2">
          <button
            className="flex items-center gap-2 text-gray-500 hover:underline"
            onClick={() => {
              navigate("/login");
              setMenuOpen(false);
            }}
          >
            <LogIn size={20} /> Log In
          </button>
          <button
            className="flex items-center gap-2 text-gray-500 hover:underline"
            onClick={() => {
              navigate("/signup");
              setMenuOpen(false);
            }}
          >
            <UserPlus size={20} /> Sign Up
          </button>
        </div>
      )}
    </nav>
  );
}
