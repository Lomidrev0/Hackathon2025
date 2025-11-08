import { useState, useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi"

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Ahoj! Ako ti môžem pomôcť? 😊" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/ai/ask?prompt=${encodeURIComponent(input)}`
      );
      if (!response.ok) throw new Error("Network error");
      const data = await response.json();

      if (data.answer) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.answer }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Nepodarilo sa odoslať správu na server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] bg-white dark:bg-dark-secondary rounded-lg shadow overflow-hidden">
      <div className="bg-blue-50 dark:bg-blue-60 text-white p-4 font-semibold">
        Četový poradca
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <MessageBubble key={index} sender={msg.sender} text={msg.text} />
        ))}

        {/* Loader bublina počas čakania */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-blue-10 dark:bg-blue-85 text-gray-800 dark:text-white rounded-2xl rounded-bl-none px-4 py-2 shadow max-w-[75%] flex space-x-1">
              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-200 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-200 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-200 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="p-2 bg-blue-10 dark:bg-blue-85 text-gray-900 dark:text-gray-100 flex justify-center">
        <div className="flex items-center bg-white dark:bg-dark-secondary border-gray-200 dark:border-neutral-700 shadow-inner rounded-lg px-4 py-2 w-full max-w-2xl dark:text-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Napíš správu..."
            className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className={`ml-2 px-4 py-2 rounded-lg transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-50 text-white hover:bg-blue-60"
            }`}
          >
            <FiSend></FiSend>
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ sender, text }) {
  const isUser = sender === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-4 py-2 text-sm shadow ${
          isUser
            ? "bg-blue-40 text-white rounded-2xl rounded-br-none"
            : "bg-blue-10 dark:bg-blue-85 text-gray-800 dark:text-white rounded-2xl rounded-bl-none"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
