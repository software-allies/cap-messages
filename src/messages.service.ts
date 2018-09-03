import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ConfigService } from './config.service';
import * as io from 'socket.io-client';
import { Socket } from './socket.interface';
import { MessageInterface } from './message.interface';

// Esto es un hack para que funcione rollup
var ioFunc = (io as any).default ? (io as any).default : io;
 
// Esto era lo que original estaba antes del hack (io en vez de _io)
// declare var _io : {
//   connect(url: string): Socket;
// };

@Injectable()
export class MessagesService {

  socket: Socket;
  observer: Observer<number>;
  observerMessage: Observer<string>;
  headers: HttpHeaders;
  apiUrl: string;

  constructor(
    private configService: ConfigService,
    private _http: HttpClient){

    // Después de aplicar hack se cambio de (socketIo a ioFunc)
    this.socket = ioFunc(configService.wsUrl);

    this.headers = new HttpHeaders();
    this.headers.set("Content-Type", "application/json; charset=UTF-8");
    this.headers.set('Authentication', localStorage.getItem('_token') || '');

    this.apiUrl = configService.apiUrl;
  }

  sendMessage(message: MessageInterface): Observable<any> {

      this.socket.emit('clientmessage', message);
      
      return this._http.post(`${this.apiUrl}messages`, message, { headers: this.headers })
          .map((response: Response) => response)
          .catch(this.handleError);
  }
  
  getMessages() : Observable<string[]> {

      return this._http.get(`${this.apiUrl}messages`, { headers: this.headers })
          .map((response: any) => response)
          .catch(this.handleError);
  }

  subscribeMessages() : Observable<string> {

    this.socket.on('message', (res) => {
      this.observerMessage.next(res.msg);
    });

    this.socket.emit('clientdata', 'Joined to chat');

    return this.createObservableString();
  }

  createObservableString() : Observable<string> {
      return new Observable<string>(observer => {
        this.observerMessage = observer;
      });
  }

  private handleError(error: any) {
    console.error('server error:', error);
    if (error.error instanceof Error) {
        let errMessage = error.error.message;
        return Observable.throw(errMessage);
    }
    return Observable.throw(error || 'Socket.io server error');
  }

}
