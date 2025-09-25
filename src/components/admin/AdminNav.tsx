import { useState } from "react";
import { Plus, HelpCircle, LogOut, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminNav() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#f8f1e8] z-50 border-b border-gray-300">
  <div className="max-w-screen-lg mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <button onClick={() => navigate('/admin')}>

        <img src={'/logoWave.png'} className="h-10" alt="Oceanic Harmony logo" />
        </button>

        {/* Botón menú hamburguesa (Tablet & Mobile) */}
        
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        

        {/* Menú de navegación */}
        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row gap-4 md:static bg-transparent shadow-md md:shadow-none p-4 md:p-0`}
        >
          <button
            className="flex items-center gap-2 text-gray-500 hover:underline"
            onClick={() => navigate("/admin/new-challenge")}
          >
            <Plus size={20} /> Dashboard
          </button>
          <button
            className="flex items-center gap-2 text-gray-500 hover:underline"
            onClick={() => navigate("/admin/new-challenge")}
          >
            <Plus size={20} /> Journals
          </button>
          <button
            className="flex items-center gap-2 text-gray-500 hover:underline"
            onClick={() => navigate("/admin/questions")}
          >
            <HelpCircle size={20} /> Questions
          </button>
          <button
            className="flex items-center gap-2 text-red-500 hover:underline"
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

export default AdminNav;
