export interface MessageInterface {
    nickname: string;
    message: string;
    room?: string;
    messages?: Array<object>;
}