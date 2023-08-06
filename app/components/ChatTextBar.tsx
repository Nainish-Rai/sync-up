import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/context/SocketProvider";
import React, { useState, useEffect } from "react";

type Props = {
  handleMsgSubmit: (text: string, user: string) => void;
  username: string;
};

function ChatTextBar({ handleMsgSubmit, username }: Props) {
  const [textMsg, setTextMsg] = useState("");

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleMsgSubmit(textMsg, username);
        }}
      >
        <Input
          value={textMsg}
          onChange={(e) => {
            setTextMsg(e.target.value);
          }}
          id="username"
          placeholder="Username"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}

export default ChatTextBar;
