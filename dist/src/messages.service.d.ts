import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { ConfigService } from './config.service';
import { Socket } from './socket.interface';
import { MessageInterface } from './message.interface';
export declare class MessagesService {
    private configService;
    private _http;
    socket: Socket;
    observer: Observer<number>;
    observerMessage: Observer<string>;
    headers: HttpHeaders;
    apiUrl: string;
    constructor(configService: ConfigService, _http: HttpClient);
    sendMessage(message: MessageInterface): Observable<any>;
    getMessages(): Observable<string[]>;
    subscribeMessages(): Observable<string>;
    createObservableString(): Observable<string>;
    private handleError(error);
}
