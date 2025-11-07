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

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate a bot reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Zatiaľ nekomunikujem so serverom, ale som tu! 🤖" },
      ]);
    }, 500);

    setInput("");
  };

  return (
    <div className="flex flex-col h-[90vh] bg-gradient-to-t from-slate-900 to-slate-950 shadow rounded-lg overflow-hidden">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <MessageBubble key={i} sender={msg.sender} text={msg.text} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="justify-center flex p-4 shadow-md">
        <div className="flex items-center bg-white shadow-md rounded-full px-4 py-2 w-full max-w-2xl border border-gray-200">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Napíš správu..."
            className="flex-1 px-3 py-2 bg-transparent outline-none text-gray-800"
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
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] px-4 py-2 text-sm shadow 
          ${
            isUser
              ? "bg-blue-500 text-white rounded-2xl rounded"
              : "bg-gray-200 text-gray-800 rounded-2xl rounded"
          }`}
      >
        {text}
      </div>
    </div>
  );
}