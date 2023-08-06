"use client";
import ChatContainer from "@/app/containers/ChatContainer";
import { useSocket } from "@/context/SocketProvider";
import React, { useCallback, useEffect, useState } from "react";

type Props = {
  params: {
    roomid: string;
  };
};

function Room({ params }: Props) {
  const socket = useSocket();

  const [activeUsers, setActiveUsers] = useState([
    localStorage.getItem("username"),
  ]);
  console.log(activeUsers);
  const [remoteId, setRemoteId] = useState("");

  const handleUserJoined = useCallback(
    ({ username, id }: { username: string; id: string }) => {},
    []
  );
  console.log(activeUsers[0]);

  useEffect(() => {
    socket.on(
      "user:joined",
      ({ username, id }: { username: string; id: string }) => {
        console.log(username + " joined", id);
        setRemoteId(id);
        setActiveUsers([...activeUsers, username]);
      }
    );

    return () => {
      socket.off("user:joined", handleUserJoined);
    };
  }, [activeUsers, handleUserJoined, socket]);

  return (
    <div>
      {params.roomid}
      <div>
        <ChatContainer yourusername={activeUsers[0]!} />
      </div>
    </div>
  );
}

export default Room;
