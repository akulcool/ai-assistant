import { useState } from "react";
import { FaPlus, FaMicrophone } from "react-icons/fa";

export default function ChatInterface() {
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-white text-center">
      {/* Centered Welcome Message */}
      <h1 className="text-4xl font-semibold bg-gradient-to-r from-blue-500 to-red-500 text-transparent bg-clip-text">
        Hello, Akul
      </h1>

      {/* Chat Input Bar */}
      <div className="absolute bottom-10 w-full flex justify-center">
        <div className="flex items-center w-3/5 max-w-2xl bg-gray-100 p-3 rounded-full shadow-md">
          <FaPlus className="text-gray-500 mx-3" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Gemini"
            className="flex-1 bg-transparent outline-none text-gray-700"
          />
          <FaMicrophone className="text-gray-500 mx-3" />
        </div>
      </div>
    </div>
  );
}
