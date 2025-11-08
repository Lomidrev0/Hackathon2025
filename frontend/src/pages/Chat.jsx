import { useState, useRef, useEffect } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Ahoj! Ako ti môžem pomôcť? 😊" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Show the user's message immediately
    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);

    // Send the message to your backend
    try {
  const response = await fetch(
    `http://localhost:8000/ai/ask?prompt=${encodeURIComponent(input)}`
  );

  if (!response.ok) throw new Error("Network error");

  const data = await response.json();

  if (data.reply) {
    setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
  }
} catch (error) {
  console.error("Error sending message:", error);
  setMessages((prev) => [
    ...prev,
    { sender: "bot", text: "⚠️ Nepodarilo sa odoslať správu na server." },
  ]);
}

    setInput("");
  };

  return (
    <div className="flex flex-col h-[80vh] bg-gray-100 rounded-lg shadow overflow-hidden">
      <div className="bg-blue-600 text-white p-4 font-semibold">Četový poradca</div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <MessageBubble key={index} sender={msg.sender} text={msg.text} />
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white flex justify-center">
        <div className="flex items-center bg-gray-100 shadow-inner rounded-full px-4 py-2 w-full max-w-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Napíš správu..."
            className="flex-1 bg-transparent outline-none text-gray-800"
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
          >
            Odoslať
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
            ? "bg-blue-500 text-white rounded-2xl rounded-br-none"
            : "bg-gray-200 text-gray-800 rounded-2xl rounded-bl-none"
        }`}
      >
        {text}
      </div>
    </div>
  );
}