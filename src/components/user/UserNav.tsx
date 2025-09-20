import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserNav() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#f8f1e8] z-50 border-b border-gray-300 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo → Home del usuario */}
        <button onClick={() => navigate("/user")}>
          <img src="/logoWave.png" className="h-10" alt="Oceanic Harmony logo" />
        </button>

        {/* Botón hamburguesa (mobile) */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Menú */}
        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row gap-4 md:static bg-transparent shadow-md md:shadow-none p-4 md:p-0`}
        >
          <button
            className="text-gray-700 hover:underline font-mono"
            onClick={() => navigate("/user/my-challenges")}
          >
            My Challenges
          </button>
          <button
            className="text-gray-700 hover:underline font-mono"
            onClick={() => navigate("/user/select-challenge")}
          >
            Select Challenge
          </button>
          <button
            className="flex items-center gap-2 text-red-500 hover:underline font-mono"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
