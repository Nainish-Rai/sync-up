import React, { useCallback, useEffect, useState } from "react";
import ChatTextBar from "../components/ChatTextBar";
import { useSocket } from "@/context/SocketProvider";

type Props = {
  yourusername: string;
};
type Message = {
  text: string;
  user: string;
};

function ChatContainer({ yourusername }: Props) {
  const socket = useSocket();
  const [msgArray, setMsgArray] = useState<Message[]>([]);
  useEffect(() => {
    socket.on("msg:send", (data: { text: string; user: string }) => {
      setMsgArray((prev) => [...prev, data]);
    });
    return () => {
      socket.off("msg:send");
    };
  }, [socket]);

  const handleMsgSubmit = useCallback(
    (text: string, user: string) => {
      socket.emit("msg:send", { text, user });
    },
    [socket]
  );

  return (
    <div>
      <div>
        {msgArray.map((msg, index) => (
          <div key={index}>
            {msg.text} <span className="font-black">{msg.user}</span>
          </div>
        ))}
      </div>
      <ChatTextBar username={yourusername} handleMsgSubmit={handleMsgSubmit} />
    </div>
  );
}

export default ChatContainer;
