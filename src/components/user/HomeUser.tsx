import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNav from "./UserNav";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return <p className="p-6 text-center">Loading profile...</p>;
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen flex flex-col">
    {/* <header className="">
        <UserNav />
      </header> */}
      
      <main className="flex flex-col items-center min-h-screen">
        {/* Logo */}
        <img
          src={"/logoWave.png"}
          className="h-40 p-4 mx-auto"
          alt="Oceanic Harmony logo"
        />

        {/* Presentación */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-600 mb-2 p-5 font-mono">
            Welcome, {profile.name || "User"} 👋
          </h1>
          <p className="text-lg font-mono text-gray-600">
            Manage your challenges and keep track of your progress.
          </p>
        </div>

        {/* Botones principales */}
        <div className="grid gap-6 w-full max-w-md">
          <button
            onClick={() => navigate("/user/my-challenges")}
            className="w-full py-4 text-xl font-semibold text-white bg-gray-400 rounded-lg shadow-lg hover:bg-gray-500 transition"
          >
            My Journals
          </button>
          <button
            onClick={() => navigate("/challenges")}
            className="w-full py-4 text-xl font-semibold text-white bg-gray-400 rounded-lg shadow-lg hover:bg-gray-500 transition"
          >
            Select Journal
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            className="w-full py-4 text-xl font-semibold text-white bg-gray-400 rounded-lg shadow-lg hover:bg-gray-500 transition"
          >
            Log out
          </button>
        </div>
      </main>
    </div>
  );
}