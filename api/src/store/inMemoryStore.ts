import { Chat, Store, UserId } from "./Store";

export interface Room {
    roomId: string,
    chats: Chat[]
}

let globalId = 0;

export class InMemoryStore implements Store {
    private store: Map<string, Room>;
    
    constructor() {
        this.store = new Map<string, Room>()

    }

    initRoom(roomId: string) {
        this.store.set(roomId, {
            roomId,
            chats: []
        })
    }

    getChats(roomId: string, limit: number, offset: number) {
        const room = this.store.get(roomId);
        if(!room) {
            return [];
        }
        return room.chats.reverse().slice(0, offset).slice(-1*limit);
    }

    addChat(userId: UserId, name: string, roomId: string, message: string) {
        const room = this.store.get(roomId);

        if(!room) {
            return null;
        }

        const chat = {
            id: String(globalId++),
            userId: userId,
            name,
            message,
            upvotes: []
        }

        room.chats.push(chat);

        return chat;
    }

    upvote(userId: UserId, roomId: string, chatId: string) {
        const room = this.store.get(roomId);
        
        if(!room) {
            return;
        }

        // Todo: Make this faster
        const chat = room.chats.find((chats) => chats.id ===chatId);
        if(chat) {
            chat.upvotes.push(userId);
        }

        return chat?.upvotes.length;
    }
}