"use client";
import ChatContainer from "@/app/containers/ChatContainer";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/SocketProvider";
import peer from "@/services/peer";
import { Mystery_Quest } from "next/font/google";
import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";

type Props = {
  params: {
    roomid: string;
  };
};
type peer = RTCPeerConnection;

function Room({ params }: Props) {
  const socket = useSocket();

  const [activeUsers, setActiveUsers] = useState([
    localStorage.getItem("username"),
  ]);
  console.log(activeUsers);
  const [remoteId, setRemoteId] = useState("");

  const [myStream, setMyStream] = useState<MediaStream>();

  const [remoteStream, setRemoteStream] = useState<MediaStream>();

  const handleUserJoined = useCallback(
    ({ username, id }: { username: string; id: string }) => {},
    []
  );
  console.log(activeUsers[0]);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
      video: true,
    });
    // const screen = await navigator.mediaDevices.getDisplayMedia();
    setMyStream(stream);
  }, []);

  const handleCutUser = () => {
    myStream?.getTracks().forEach((track) => (track.enabled = false));
    myStream?.getTracks().forEach((track) => track.stop());

    myStream?.getVideoTracks().length! > 0 &&
      myStream?.getVideoTracks()[0].stop();
    myStream?.getAudioTracks().length! > 0 &&
      myStream?.getAudioTracks()[0].stop();

    setMyStream(undefined);
    console.log(myStream);
  };

  const handleIncomingCall = useCallback(
    async ({ from, offer }: { from: string; offer: RTCSessionDescription }) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
        video: true,
      });
      // const screen = await navigator.mediaDevices.getDisplayMedia();
      setMyStream(stream);

      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    ({ from, ans }: { from: string; ans: RTCSessionDescription }) => {
      peer.setLocalDescription(ans);

      for (const track of myStream?.getTracks()!) {
        peer.peer.addTrack(track, myStream!);
      }
    },
    [myStream]
  );

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev: RTCTrackEvent) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  });

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: params.roomid });
  }, [params.roomid, socket]);
  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoIncoming = useCallback(
    async ({ from, offer }: { from: string; offer: RTCSessionDescription }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(
    async ({ from, ans }: { from: string; ans: RTCSessionDescription }) => {
      await peer.setLocalDescription(ans);
    },
    []
  );
  useEffect(() => {
    socket.on(
      "user:joined",
      ({ username, id }: { username: string; id: string }) => {
        console.log(username + " joined", id);
        setRemoteId(id);
        setActiveUsers([...activeUsers, username]);
      }
    );

    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoIncoming);
    socket.on("peer:nego:final", handleNegoFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [
    activeUsers,
    handleCallAccepted,
    handleIncomingCall,
    handleNegoFinal,
    handleNegoIncoming,
    handleUserJoined,
    socket,
  ]);

  useEffect(() => {
    async function revieveOffer() {
      const offer = await peer.getOffer();
      socket.emit("user:call", { to: params.roomid, offer });
    }
    revieveOffer();
  }, [params.roomid, socket]);

  return (
    <div>
      {params.roomid}
      <div className="bg-gray-200">
        <h3>Active Users</h3>
        {activeUsers.map((user, index) => (
          <div key={index}>{user}</div>
        ))}
      </div>
      {myStream && (
        <div className="rounded-xl overflow-hidden w-96  flex justify-center items-center  m-16   aspect-video">
          <ReactPlayer playing url={myStream} style={{ objectFit: "cover" }} />
        </div>
      )}
      <Button onClick={handleCallUser}>Call</Button>
      <Button onClick={handleCutUser}>Cut</Button>
      <Button
        onClick={() => {
          myStream?.getAudioTracks()[0].stop();
        }}
      >
        mute
      </Button>
      <Button
        onClick={() => {
          myStream?.getVideoTracks()[0].stop();
        }}
      >
        Camera off
      </Button>
      <div>
        <ChatContainer yourusername={activeUsers[0]!} />
      </div>
    </div>
  );
}

export default Room;
