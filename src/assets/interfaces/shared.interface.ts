export interface IUser {
  name: string;
  id: number;
  isCurrent: boolean;
  notification: number;
}

export interface IMessage {
  text: string;
  id: number;
  userId: number;
  timestamp: Date;
  userName?: string;
}

export interface IConfig {
  placeholder: string;
  buttonLabel: string;
}
