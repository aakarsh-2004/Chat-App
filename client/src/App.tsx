import { useEffect, useState } from 'react'
import './App.css'

async function createWebSocketConnection() {
  try {
    const socket = new WebSocket("ws://localhost:8080");
    return socket;
  } catch (error) {
    console.log(error);
  }
}

const userDetails = {
  name: "Aakarsh",
  userId: "1",
  roomId: "1"
}

function App() {
  const [socket, setSocket] = useState<WebSocket>();
  const [message, setMessage] = useState<string>("");
  const [chats, setChats] = useState("");

  useEffect(() => {
    async function connect() {
      const conn = await createWebSocketConnection();
      setSocket(conn)
    }

    connect()
  }, [])

  if(!socket) {
    return (
      <div>
        Not connected to any room
      </div>
    )
  }

  socket.onopen = () => {
    console.log("connection established successfully");
    try {
      const response = socket.send(JSON.stringify({
        type: "JOIN_ROOM",
        payload: userDetails
      }));
      console.log(response);
    } catch (error) {
      console.log("Error while creating user "+error)
    }
  }

  const sendMessage = () => {
    const payload = {
      name: "Aakarsh",
      userId: "1",
      roomId: "1",
      message: message
    }

    try {
      const response = socket.send(JSON.stringify({
        type: "SEND_MESSAGE",
        payload
      }))
      console.log(response);
      
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="App">
      <input type="text" placeholder='Enter your message' onChange={(e) => setMessage(e.target.value)} value={message}/>
      <button onClick={sendMessage}>Send Chat</button>
    </div>
  )
}

export default App
