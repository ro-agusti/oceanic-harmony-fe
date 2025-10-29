import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch, API } from '../../../config/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!challengeId) return;
      setLoading(true);
      setError("");

      try {
        const res = await apiFetch<{ challenge: Challenge }>(
          API.challenges.byId(challengeId)
        );

        if (!res.ok) {
          throw new Error((res.data as any)?.message || "Failed to fetch challenge");
        }

        setOriginalChallenge(res.data!.challenge);
        setEditableChallenge(res.data!.challenge);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load challenge");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editableChallenge || !challengeId) return;

    try {
      const res = await apiFetch(
        API.challenges.byId(challengeId),
        {
          method: "PUT",
          body: JSON.stringify(editableChallenge),
        }
      );

      if (!res.ok) {
        throw new Error((res.data as any)?.message || "Failed to update challenge");
      }

      alert("Challenge updated successfully");
      navigate("/admin/challenges");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update challenge");
    }
  };

  if (loading) return <p className="mt-10 text-center">Loading...</p>;
  if (error || !originalChallenge) return <p className="mt-10 text-center text-red-500">{error || "Challenge not found"}</p>;

  return (
    <div className="max-w-6xl w-full mx-auto mt-20 p-4 sm:p-6 md:p-8 bg-white shadow rounded">
      <h2 className="text-2xl font-mono font-bold mb-6 text-gray-800 text-center">
        Edit Challenge
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Actual Challenge</h3>
          <div className="text-left bg-gray-50 border border-gray-200 rounded p-4 space-y-3 text-sm text-gray-700 font-mono break-words">
            <p><strong>Title:</strong> {originalChallenge.title}</p>
            <p><strong>Description:</strong> {originalChallenge.description}</p>
            <p><strong>Days:</strong> {originalChallenge.days}</p>
            <p><strong>Price:</strong> {originalChallenge.price}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-mono text-gray-600 mb-1">New title</label>
            <input
              type="text"
              name="title"
              onChange={handleChange}
              className="border bg-inherit w-full p-2 font-mono border-gray-300 rounded focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-gray-600 mb-1">New description</label>
            <textarea
              name="description"
              onChange={handleChange}
              className="border bg-inherit w-full p-2 font-mono border-gray-300 rounded focus:ring-2 focus:ring-gray-200"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-gray-600 mb-1">New days number</label>
            <input
              type="number"
              name="days"
              onChange={handleChange}
              className="border bg-inherit w-full p-2 font-mono border-gray-300 rounded focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-gray-600 mb-1">New price</label>
            <input
              type="text"
              name="price"
              onChange={handleChange}
              className="border bg-inherit w-full p-2 font-mono border-gray-300 rounded focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between mt-8 gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/challenges")}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 w-full sm:w-auto transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 w-full sm:w-auto transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
