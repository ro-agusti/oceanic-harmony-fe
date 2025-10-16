import { useNavigate } from "react-router-dom";
//import Challenges from './Challenges';

function HomeAdmin() {
  const navigate = useNavigate();

  return (
    <div>
      <img src={'/logoWave.png'} className= 'h-40 p-4 mx-auto' alt="Oceanic Harmony logo" />
{/* <button onClick={() => navigate('/')}>
      <img src={'/logoWave.png'} className= 'h-40 p-4 mx-auto' alt="Oceanic Harmony logo" />
      </button> */}
    <div className="flex flex-col items-center  min-h-screen p-6">
      {/* Presentación */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-600 mb-2 p-5 font-mono">
          Welcome to Oceanic Harmony dashboard
        </h1>
        <p className="text-lg font-mono text-gray-600">
        Manage challenges, journals and questions to enhance the user experience.
        </p>
      </div>

      {/* Botones grandes */}
      <div className="grid gap-6 w-full max-w-md">
        <button
          onClick={() => navigate("/admin/challenges")}
          className="w-full py-4 text-xl font-semibold text-white bg-gray-500 rounded-lg shadow-lg hover:bg-gray-600 transition"
        >
          Journals Manager
        </button>
        {/* <button
          onClick={() => navigate("/admin/Journals")}
          className="w-full py-4 text-xl font-semibold text-white bg-gray-500 rounded-lg shadow-lg hover:bg-gray-600 transition"
        >
          Journals
        </button> */}
        <button
          onClick={() => navigate("/admin/Questions")}
          className="w-full py-4 text-xl font-semibold text-white bg-gray-500 rounded-lg shadow-lg hover:bg-gray-600 transition"
        >
          Questions Manager
        </button>
        <button
          onClick={() => navigate("/challenges")}
          className="w-full py-4 text-xl font-semibold text-white bg-gray-500 rounded-lg shadow-lg hover:bg-gray-600 transition"
        >
          Journals
        </button>
        <button
          onClick={() => navigate("/user/my-challenges")}
          className="w-full py-4 text-xl font-semibold text-white bg-gray-500 rounded-lg shadow-lg hover:bg-gray-600 transition"
        >
          My Journals
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          className="w-full py-4 text-xl font-semibold text-gray-500 bg-gray-300 rounded-lg shadow-lg hover:bg-gray-200 transition"
        >
          Log out
        </button>
      </div>
    </div>
    </div>
  );
}

export default HomeAdmin;
