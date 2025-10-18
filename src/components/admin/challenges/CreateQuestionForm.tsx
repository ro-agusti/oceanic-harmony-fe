import { useState } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
interface CreateQuestionFormProps {
  challengeId?: string;
  onQuestionCreated?: () => void;
}

function CreateQuestionForm({ onQuestionCreated }: CreateQuestionFormProps) {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [responseType, setResponseType] = useState("text");
  const [allowCustomText, setAllowCustomText] = useState(false);
  const [options, setOptions] = useState<string[]>(["", "", ""]); // por defecto 3 opciones
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("🔐 Admin token not found");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/questions`, {
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
          options:
            responseType === "multiple-choice"
              ? options.filter((o) => o.trim() !== "").map((o) => ({ text: o }))
              : undefined,
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
      setOptions(["", "", ""]);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "❌ Error creating question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="text-left space-y-4 p-4 font-mono font-semibold text-gray-600 text-sm w-full h-[350px] overflow-y-auto"
    >
      <div>
        <label className="block">Question Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="bg-[#fbf7f1] w-full border shadow px-3 py-2 rounded mt-1"
          required
        />
      </div>

      <div>
        <label className="block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-[#fbf7f1] w-full border shadow px-3 py-2 rounded mt-1"
        />
      </div>

      <div>
        <label className="block">Response Type</label>
        <select
          value={responseType}
          onChange={(e) => setResponseType(e.target.value)}
          className="bg-[#fbf7f1] w-full border shadow px-3 py-2 rounded mt-1"
        >
          <option value="text">Text</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="multiple-text">Multiple Text</option>
        </select>
      </div>

      {/* Opciones dinámicas si es multiple-choice */}
      {responseType === "multiple-choice" && (
        <div>
          <label className="block mb-2">Options</label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className="bg-[#fbf7f1] flex-1 border shadow px-3 py-2 rounded"
                placeholder={`Option ${idx + 1}`}
                required
              />
              {options.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="text-gray-500 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="mt-2 text-gray-500 text-sm underline"
          >
            ➕ Add Option
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={allowCustomText}
          onChange={(e) => setAllowCustomText(e.target.checked)}
          id="allowCustomText"
        />
        <label htmlFor="allowCustomText" className="text-sm">
          Allow Custom Text
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-gray-400 text-m font-mono text-white mb-4 hover:bg-slate-500"
      >
        {loading ? "Saving..." : "Save Question"}
      </button>
    </form>
  );
}

export default CreateQuestionForm;
