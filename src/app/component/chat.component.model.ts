import { IMessage, IUser } from "src/assets/interfaces/shared.interface";

export class User implements IUser {
    name: string;
    id: number;
    isCurrent: boolean;
}

export class Message implements IMessage {
    text: string;
    id: number;
    userId: number;
    timestamp: Date;
    userName?: string;
}