import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft} from "lucide-react";
import AdminNav from "../AdminNav";
import { postJSON, tokenService, API } from '../../../config/api';

function CreateChallenge() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [days, setDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = tokenService.get();
    if (!token) {
      alert("🔐 Admin token not found");
      return;
    }

    setLoading(true);

    try {
      const res = await postJSON<{ challenge: any }>(
        API.challenges.all,
        { title, description, price, days }
      );

      if (!res.ok) {
        throw new Error((res.data as any)?.message || "Failed to create challenge");
      }

      alert(`✅ Challenge "${res.data.challenge.title}" created successfully!`);

      navigate(`/admin/challenge-manager/${res.data.challenge.id}`, {
        state: {
          success: true,
          challengeName: res.data.challenge.title,
        },
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || "❌ Error creating challenge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNav />
     
    <div className="p-6 max-w-xl mx-auto mt-20 bg-white">
      <div className="flex justify-between items-start mb-4">
  <h1 className="text-2xl font-bold text-gray-700 font-mono">
    Let's create a new challenge
  </h1>
  <button
          onClick={() => navigate("/admin/challenges")}
          className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
        </button>
</div>

      
     <form onSubmit={handleSubmit} className="flex flex-col gap-4">

  
  <div className="flex flex-col">
    <label className="text-left text-sm font-mono text-gray-600">Title</label>
    <input
      type="text"
      placeholder="Title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="border bg-inherit p-2 font-mono border-gray-300 rounded"
      required
    />
  </div>

  
  <div className="flex flex-col">
    <label className="text-left text-sm font-mono text-gray-600">Description</label>
    <textarea
      placeholder="Description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      className="border bg-inherit p-2 font-mono border-gray-300 rounded"
      required
    />
  </div>

  <div className="flex gap-4">
    {/* PRICE */}
    <div className="flex flex-col w-1/2">
      <label className="text-left text-sm font-mono text-gray-600">Price</label>
      <div className="flex items-center border border-gray-300 bg-inherit p-2 rounded">
        <span className="text-gray-500 mr-1">$</span>
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="bg-inherit outline-none w-full font-mono"
          required
        />
      </div>
    </div>

    <div className="flex flex-col w-1/2">
      <label className="text-left text-sm font-mono text-gray-600">Duration (days)</label>
      <input
        type="number"
        placeholder="Duration"
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        className="border bg-inherit p-2 font-mono border-gray-300 rounded"
        required
      />
    </div>
  </div>

  
  <button
            type="submit"
            disabled={loading}
            className="bg-gray-400 font-bold text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            {loading ? "Creating..." : "Create and select questions"}
          </button>
  

</form>
    </div>
 </> );
  
}


export default CreateChallenge;
