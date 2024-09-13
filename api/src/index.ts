import { connection, server as WebSocketServer } from "websocket";
import http from 'http';
import { IncomingMessageType, SupportedMessage } from "./messages/incomingMessages";
import { OutgoingMessage, SupportedMessage as OutgoingSupportedMessage } from "./messages/outgoingMessages";
import { UserManager } from "./UserManager";
import { InMemoryStore } from "./store/inMemoryStore";

const server = http.createServer((req: any, res: any) => {
    console.log(`${new Date()} : Received request for ${req.url}`);
    res.writeHead(404);
    res.end();
}) 

const userManager = new UserManager();
const store = new InMemoryStore();


server.listen(8080, () => {
    console.log(`${new Date()} : Server is listening on port 8080`);
})

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
})

function originIsAllowed(origin: string) {
    // put logic here to detect whether the specified origin is allowed
    return true;
}

wsServer.on('request', (request) => {
    console.log(`Connection request from ${request.origin}`);
    
    if(!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log(`${new Date()} Connection from origin ${request.origin} rejected`);
        return;
    }

    const connection = request.accept(null, request.origin);
    console.log(`${new Date()} Connection accepted!`);
    
    connection.on('message', (message) => {
        // To do : add rate limiting logic here
        if(message.type === 'utf8') {
            console.log(`Received message ${message.utf8Data}`);
            connection.sendUTF(message.utf8Data);

            try {
                messageHandler(connection, JSON.parse(message.utf8Data))
            } catch (error) {
                console.log(error)
            }
        }
    });

})


function messageHandler(ws: connection, message: IncomingMessageType) {
    console.log(`Incoming message : ${JSON.stringify(message)}`);

    if(message.type == SupportedMessage.JoinRoom) {
        const payload = message.payload;
        userManager.addUser(payload.name, payload.userId, payload.roomId, ws);

    } else if(message.type == SupportedMessage.SendMessage) {
        const payload = message.payload;
        const user = userManager.getUser(payload.roomId, payload.userId)

        if(!user) {
            console.error("user not found in the db");
            return;
        }

        const chat = store.addChat(payload.userId, user.name, payload.roomId, payload.message);
        if(!chat) {
            console.error("Chat not found");
            return;
        }
        
        const outgoingPayload: OutgoingMessage = {
            type: OutgoingSupportedMessage.AddChat,
            payload: {
                chatId: chat?.id,
                roomId: payload.roomId,
                message: payload.message,
                name: user.name,
                upvotes: 0
            }
        }

        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload)

    } else if(message.type == SupportedMessage.UpvoteMessage) {
        const payload = message.payload;
        const upvotes = store.upvote(payload.userId, payload.roomId, payload.chatId);
        

        const outgoingPayload: OutgoingMessage = {
            type: OutgoingSupportedMessage.UpdateChat,
            payload: {
                chatId: payload.chatId,
                roomId: payload.roomId,
                upvotes: upvotes 
            }
        }

        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
    }
}