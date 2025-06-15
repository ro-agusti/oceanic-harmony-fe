import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNav from "../AdminNav";

function CreateChallenge() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [days, setDays] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    // console.log("Token:", token);
    // localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMjY1MDAwMi1mYjU4LTRiOTItOWM4Yi0xYTdmMzUyNWQ3OGQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDg2NjU1MjgsImV4cCI6MTc0ODY2OTEyOH0.3F4C2T4VMOGlAT7smmNv2pXXiPjlyk0dtYmXN83e19k");

    try {
      
      const response = await fetch("http://localhost:3000/api/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, price, days }),
      });

      const data = await response.json();
      console.log("Response del backend:", data);

      if (response.ok) {
        navigate(`/admin/assign-questions/${data.challenge.id}`);
      } else {
        console.error(data.error);
      }
     
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <AdminNav />
    <div className="p-6 max-w-xl mx-auto mt-20">
      <h1 className="text-2xl font-bold text-gray-700 font-mono mb-4">Let's create a new challenge</h1>
     <form onSubmit={handleSubmit} className="flex flex-col gap-4">

  {/* TITLE */}
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

  {/* DESCRIPTION */}
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

  {/* PRICE & DURATION */}
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

    {/* DURATION */}
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

  {/* SUBMIT BUTTON */}
  <button
    type="submit"
    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
  >
    Create and select questions
  </button>

</form>
    </div>
 </> );
  
}


export default CreateChallenge;
