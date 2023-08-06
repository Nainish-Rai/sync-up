import React, { useContext, useMemo } from "react";
import { io } from "socket.io-client";

// Create a context for the socket
const SocketContext = React.createContext<any>(null);

// Custom hook to access the socket from the context
export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

// Provider component that wraps the app and provides the socket through the context
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  // Create a new socket connection using the socket.io-client library
  const socket = useMemo(() => io("http://localhost:8000"), []);

  // Render the children components with the socket value provided through the context
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
