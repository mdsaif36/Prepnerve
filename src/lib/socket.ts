import { io, Socket } from "socket.io-client";

let socket: Socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("https://prepnerveserver.onrender.com", {
      transports: ["websocket"], // ⚡ Critical for Render
      withCredentials: true,     // ⚡ Critical for CORS/Session cookies
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    // Helpful for debugging connection issues in the browser console
    socket.on("connect_error", (err) => {
      console.error("⚠️ Socket Connection Error:", err.message);
    });
  }
  return socket;
};
