"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/context/SocketProvider";
import { useRouter } from "next/navigation";

type Props = {};

function JoinRoom({}: Props) {
  // Initialize the router and state variables
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const socket = useSocket();

  // Set up an effect to listen for the "room:join" event from the socket
  useEffect(() => {
    socket.on(
      "room:join",
      ({ username, room }: { username: string; room: string }) => {
        console.log(username, room);
      }
    );
  }, [socket]);

  // Handle form submission
  const handleformSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Emit a "room:join" event with the entered username and room
      socket.emit("room:join", {
        username,
        room,
      });
    },
    [username, room, socket]
  );

  // Handle the "room:join" event from the socket
  const handleroomjoin = useCallback(
    (data: { username: string; room: string }) => {
      const { username, room } = data;
      console.log(username, room);
      // Redirect to the room page with the entered room as a parameter
      router.push(`/room/${room}`);
    },
    [router]
  );

  // Set up an effect to listen for the "room:join" event from the socket and handle it
  useEffect(() => {
    socket.on("room:join", handleroomjoin);
    return () => {
      socket.off("room:join", handleroomjoin);
    };
  }, [socket, handleroomjoin]);

  // Render the component
  return (
    <main className="w-full h-screen flex justify-center items-center">
      <div>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Join Room</CardTitle>
            <CardDescription>
              Join a room to see what&apos;s happening
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleformSubmit}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      localStorage.setItem("username", e.target.value);
                    }}
                    id="username"
                    placeholder="Username"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="room">Room</Label>
                  <Input
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    id="room"
                    placeholder="Room"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button type="submit">Join</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default JoinRoom;
