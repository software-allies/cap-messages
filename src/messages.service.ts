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
import { PrivateMessagesInterface } from './privateMessages.interface';

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
  localArrayRooms: Array<string> = [];
  count = 1;
  checked = false;

  constructor(
    public configService: ConfigService,
    private _http: HttpClient){

    // Después de aplicar hack se cambio de (socketIo a ioFunc)
    this.socket = ioFunc(configService.wsUrl);

    this.headers = new HttpHeaders();
    this.headers.set("Content-Type", "application/json; charset=UTF-8");
    this.headers.set('Authentication', localStorage.getItem('_token') || '');

    this.apiUrl = configService.apiUrl;
  }

  sendMessage(message: MessageInterface){
      //Here sends a message y saves that message in loopback
      this.socket.emit('send message', message);
  }
  
  newMessage(): Observable<any>{
    let observable = new Observable(observer => {
        this.socket.on('new message', (data: MessageInterface) => {
            observer.next(data);
        });
    });
    return observable;
  }

  newUser(user: Object) {
    this.socket.emit('new user', user);
  }

  getUsers(): Observable<any>{
    let observable = new Observable(observer => {
      this.socket.on('get users', (data: string[]) => {
        observer.next(data);
      });
    });
    return observable;
  }
  
  getUserId(): Observable<any>{
    this.socket.emit('getMyId', 'id');
    let observable = new Observable(observer =>{
      this.socket.on('getId', (data: string) => {
        observer.next(data);
      });
    });
    return observable;
  }

  //registerComponent
  saveUsersToDB(user: Object): Observable<any> {
    return this._http.post(`${this.apiUrl}Users`, user, { headers: this.headers })
      .map((response: Response) => response)
      .catch(this.handleError);
  }

  /* not used */
  loginUser(user: Object): Observable<any>{
    return this._http.post(`${this.apiUrl}Users/login`, user, { headers: this.headers})
      .map((response: Response) => response)
      .catch(this.handleError);
  }
  /* not used */
  getUserInformation(user: Object): Observable<any>{
    return this._http.post(`${this.apiUrl}Users`, user, { headers: this.headers})
    .map((response: Response) => response)
    .catch(this.handleError);
  }

  saveToDB(message: MessageInterface): Observable<any> {
    return this._http.post(`${this.apiUrl}messages`, message, { headers: this.headers })
        .map((response: Response) => response)
        .catch(this.handleError);
  }
  
  getMessages() : Observable<string[]> {
      //Here gets the messages from loopback
      //io.connect();
      return this._http.get(`${this.apiUrl}messages`, { headers: this.headers })
          .map((response: any) => response)
          .catch(this.handleError);
  }

  /* This is for private messages feature */
  savePrivateMessageToDB(PrivateMessage: PrivateMessagesInterface): Observable<any> {
    return this._http.post(`${this.apiUrl}privateMessages`, PrivateMessage, { headers: this.headers })
        .map((response: Response) => response)
        .catch(this.handleError);
  }

  //This is not finished
  getRooms() : Observable<string[]> {
    return this._http.get(`${this.apiUrl}privateMessages`, { headers: this.headers })
          .map((response: any) => response)
          .catch(this.handleError);
  }

  sendPrivateInvitation(privateInvitation: PrivateMessagesInterface) {
    console.log('id: ', privateInvitation);
    this.socket.emit('sendPrivateInvitation', 
      {'idSockedTo': privateInvitation.idSockedTo, 'idSockedFrom': privateInvitation.idSockedFrom,'room': privateInvitation.room});
  }

  receiveRooms(){
    if(!this.checked){
      console.log('Here I am');
      this.socket.on('receiveRooms', (data) => {
        if(typeof this.localArrayRooms !== 'undefined' && this.localArrayRooms.length > 0){
          if(this.localArrayRooms.indexOf(data) >= 0) {
              console.log(this.localArrayRooms);
          }else {
              this.localArrayRooms.push(data);
              this.userJoinTo(data);
              //this.socket.emit('joinToRoom', data);
              console.log(this.localArrayRooms);
          }
        }else{
          this.localArrayRooms.push(data);
          this.userJoinTo(data);
          //this.socket.emit('joinToRoom', data);
          console.log('empty', this.localArrayRooms);
        }
      });
      this.checked = true;
    }
  }

  userJoinTo(room: string){
    //this.socket.emit('joinTo', room);
    console.log('user has Join to: ', room);
  }

  newMessagePrivate(): Observable<any>{
    let observable = new Observable(observer => {
        this.socket.on('new message', (data: MessageInterface) => {
            observer.next(data);
        });
    });
    return observable;
  }

  getSocketObject() : Socket {
    return this.socket;
  }

  createObservableString(): Observable<string> {
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
