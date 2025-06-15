import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
//import { Challenge } from '../types/challenge';

interface Challenge {
  id: string;
  title: string;
  description: string;
  price: string;
  days: number;
}

export default function EditChallenge() {
  
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [originalChallenge, setOriginalChallenge] = useState<Challenge | null>(null);
  const [editableChallenge, setEditableChallenge] = useState<Challenge | null>(null);

 // const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChallenge = async () => {
      const token = localStorage.getItem("token");
      if (!token || !challengeId) return;

      try {
        const response = await fetch(`http://localhost:3000/api/challenge/${challengeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Error al obtener el challenge");

        const data = await response.json();
        //console.log("DATA RECIBIDA:", data.challenge);
        setOriginalChallenge(data.challenge);
        setEditableChallenge(data.challenge);
        //setChallenge(data.challenge); // o ajustá según la respuesta exacta
      } catch (err) {
        console.error(err);
        setError("Error cargando el challenge");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  if (!editableChallenge) return;
  const { name, value } = e.target;
  setEditableChallenge({
    ...editableChallenge,
    [name]: name === "days" ? Number(value) : value,
  });
};

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   if (!challenge) return;
  //   const { name, value } = e.target;
  //   setChallenge({ ...challenge, [name]: name === "days" ? Number(value) : value });
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editableChallenge || !challengeId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3000/api/challenge/${challengeId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editableChallenge),
      });

      if (!response.ok) throw new Error("Error al actualizar challenge");

      alert("Challenge actualizado correctamente");
      navigate("/admin/challenges");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar challenge");
    }
  };

  if (loading) return <p className="mt-10 text-center">Cargando...</p>;
  if (error || !originalChallenge) return <p className="mt-10 text-center text-red-500">{error || "Challenge no encontrado"}</p>;

  return (
  <div className="max-w-6xl mx-auto mt-20 p-6 bg-white shadow rounded">
    <h2 className="text-2xl font-mono font-bold mb-6 text-gray-800 text-center">Edit Challenge</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      
      {/* Vista actual */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Actual Challenge</h3>
        <div className="text-left bg-gray-50 border border-gray-200 rounded p-4 space-y-4 text-sm text-gray-700 font-mono">
          <p><strong>Title:</strong> {originalChallenge.title}</p>
          <p><strong>Description:</strong> {originalChallenge.description}</p>
          <p><strong>Days:</strong> {originalChallenge.days}</p>
          <p><strong>Price:</strong> {originalChallenge.price}</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-1">
        <div>
          <label className="text-left block text-sm font-mono text-gray-600">New title</label>
          <input
            type="text"
            name="title"
            //value={editableChallenge?.title}
            onChange={handleChange}
            className="border bg-inherit w-full p-2 font-mono border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label className="text-left block text-sm font-mono text-gray-600">New description</label>
          <textarea
            name="description"
            //value={editableChallenge?.description}
            onChange={handleChange}
            className="border bg-inherit w-full p-2 font-mono border-gray-300 rounded"
            rows={4}
          />
        </div>

        <div>
          <label className="text-left block text-sm font-mono text-gray-600">New days number</label>
          <input
            type="number"
            name="days"
            //value={editableChallenge?.days}
            onChange={handleChange}
            className="border bg-inherit w-full p-2 font-mono border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="text-left block text-sm font-mono text-gray-600">New price</label>
          <input
            type="text"
            name="price"
            //value={editableChallenge?.price}
            onChange={handleChange}
            className="border bg-inherit w-full p-2 font-mono border-gray-300 rounded"
          />
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => navigate("/admin/challenges")}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
);
}
