import { useState } from "react";
import toast from "react-hot-toast";

interface CreateQuestionFormProps {
    challengeId?: string;
  onQuestionCreated?: () => void; // para refrescar lista si se necesita
}

function CreateQuestionForm({ onQuestionCreated }: CreateQuestionFormProps) {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [responseType, setResponseType] = useState("text");
  const [allowCustomText, setAllowCustomText] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("🔐 Admin token not found");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          description,
          responseType,
          allowCustomText,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create question");
      }

      toast.success("✅ Question created!");
      if (onQuestionCreated) onQuestionCreated();

      // reset form
      setText("");
      setDescription("");
      setResponseType("text");
      setAllowCustomText(false);

      // trigger callback
      onQuestionCreated?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "❌ Error creating question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-left space-y-4 p-4 font-mono font-semibold text-gray-600 text-sm w-full ">
      <div>
        <label className="block">Question Text</label>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          className="bg-[#fbf7f1] w-full border shadow px-3 py-2 rounded mt-1"
          required
        />
      </div>

      <div>
        <label className="block">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="bg-[#fbf7f1] w-full border shadow px-3 py-2 rounded mt-1"
        />
      </div>

      <div>
        <label className="block">Response Type</label>
        <select
          value={responseType}
          onChange={e => setResponseType(e.target.value)}
          className="bg-[#fbf7f1] w-full border shadow px-3 py-2 rounded mt-1"
        >
          <option value="text">Text</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="multiple-text">Multiple Text</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={allowCustomText}
          onChange={e => setAllowCustomText(e.target.checked)}
          id="allowCustomText"
        />
        <label htmlFor="allowCustomText" className="text-sm">Allow Custom Text</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className=" bg-gray-400 text-m font-mono text-white mb-4 hover:bg-slate-500"
      >
        {loading ? "Saving..." : "Save Question"}
      </button>
    </form>
  );
}

export default CreateQuestionForm;
