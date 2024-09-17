"use client"

import { useEffect, useState } from "react";


type messageType = {
  chatId: string,
  roomId: string,
  message: string,
  upvotes: string[]
}

export default function Home() {
  const [socket, setSocket] = useState<WebSocket>();
  const [message, setMessage] = useState<string>("");
  const [chats, setChats] = useState<messageType[]>([]);

  useEffect(() => {
    function connectToWebSocket() {
      const conn = new WebSocket('ws://localhost:8080');
      setSocket(conn);
      console.log(conn);
    }

    connectToWebSocket();
  }, [])
  

  if(socket) {
    socket.onopen = () => {
      const details = {
        type: "JOIN_ROOM",
        payload: {
          name: "Aakarsh",
          userId: "1",
          roomId: "1"
        }
      }
      socket.send(JSON.stringify(details));
    }

    socket.onmessage = (e) => {
      console.log(JSON.parse(e.data));
      
      const { payload, type } = JSON.parse(e.data);;

      if(type=="ADD_CHAT") {
        const incomingMessage = {
          chatId: payload.chatId,
          roomId: payload.roomId,
          message: payload.message,
          upvotes: payload.upvotes
        }

        setChats((prevChats) => {
          return [
            ...prevChats,
            incomingMessage
          ]
        })
        console.log(chats);
      }
    }
  }

  const handleClick = () => {
    const details = {
      type: "SEND_MESSAGE",
      payload: {
        name: "Aakarsh",
        userId: "1",
        roomId: "1",
        message: message
      }
    }

    socket?.send(JSON.stringify(details));
    setMessage("");
  }

  const handleUpvotes = (chatId: string, roomId: string, userId: string) => {
    const details = {
      type: "UPVOTE_MESSAGE",
      payload: {
        chatId,
        roomId,
        userId
      }
    }

    socket?.send(JSON.stringify(details))
  }

  return (
    <div className="App">

      <input type="text" onChange={(e) => setMessage(e.target.value)} value={message} placeholder="type.." className="border-2 "/>
      <button onClick={handleClick}>Send</button>

      {chats && chats.reverse().map((chat, index) => {
        return (
          <div key={index} className={chat.chatId+" p-3"}>
            <h1 className="text-2xl font-bold">{chat.message}</h1>
            <div className="flex gap-2">
              <p>{chat.upvotes.length}</p>
              <button className="border-2 p-1" onClick={() => handleUpvotes(chat.chatId, chat.roomId, "1")}>+</button>
            </div>
          </div>
        )
      })}
    </div>
  );
}
