import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ConfigService } from './config.service';
import * as io from 'socket.io-client';
import { Socket } from './socket.interface';
import { MessageInterface } from './message.interface';
import { PrivateMessagesInterface } from './privateMessages.interface';
//import { PrivateMessageModal } from './components/messages/messages.component';

var ioFunc = (io as any).default ? (io as any).default : io;

@Injectable()
export class MessagesService {

  socket: Socket;
  observer: Observer<number>;
  observerMessage: Observer<string>;
  headers: HttpHeaders;
  apiUrl: string;
  localArrayRooms: Array<string> = [];
  checked = false;
  chanelOpen = false;
  //arrayOther :any = [{}];
  arraySubscribersPrivateMessages: Subscription = new Subscription;
  messagesAndRooms: any = { rooms: {} };
  usersConnected: string[] = [];
  

  constructor(
    public configService: ConfigService,
    private _http: HttpClient){
    //This code is the example of how to add dynamically values to an JSON Object
    // var jsonObj: any = { 
    //   rooms: 
    //     {
    //       victor: [
    //         {
    //           message: 'hell',
    //           from: 'Manuel',
    //           to: 'maria'
    //         }
    //       ]
    //     }
    // }
    // var newUser = "Juanita";  
    // console.log(jsonObj.rooms.victor);
    // jsonObj.rooms.victor.push({message: 'hssll', from: 'Manuel', to: 'Laria'});
    // console.log(jsonObj.rooms.victor);
    // jsonObj.rooms[`${newUser}`] = [];
    // jsonObj.rooms[`${newUser}`].push({message: '1212', from: 'Manuel', to: 'YES!!'});
    // console.log(jsonObj);
    // this.// = jsonObj.rooms['victor'];
    // for(let i = 0; i < this.//.length; i++){
    //   console.log(this.//[i].message);
    // }

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
  
  //Here gets the messages from loopback
  getMessages() : Observable<string[]> {
      return this._http.get(`${this.apiUrl}messages`, { headers: this.headers })
          .map((response: any) => response)
          .catch(this.handleError);
  }

  /*########################################*/
  /* This is for private messages feature */
  /*########################################*/
  savePrivateMessageToDB(PrivateMessage: PrivateMessagesInterface): Observable<any> {
    return this._http.post(`${this.apiUrl}privateMessages`, PrivateMessage, { headers: this.headers })
        .map((response: Response) => response)
        .catch(this.handleError);
  }

  //Here gets the messages from loopback
  getPrivateMessages(room: any) : Observable<any[]> {
    return this._http.get(`${this.apiUrl}privateMessages?filter[where][room]=${room}`, { headers: this.headers })
        .map((response: any) => response)
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
    this.socket.emit(
      'sendPrivateInvitation', 
      {
        'idSockedTo': privateInvitation.idSockedTo, 
        'idSockedFrom': privateInvitation.idSockedFrom, 
        'room': privateInvitation.room
      }
    );
  }

  receiveRooms(){
    if(!this.checked){
      this.socket.on('receiveRooms', (data) => {
        if(typeof this.localArrayRooms !== 'undefined' && this.localArrayRooms.length > 0){
          if(this.localArrayRooms.indexOf(data) >= 0) {
              console.log(this.localArrayRooms);
          }else {
              this.localArrayRooms.push(data);
              this.createSubscriptionToChannel(data);
          }
        }else{
          this.localArrayRooms.push(data);
          this.createSubscriptionToChannel(data);
        }
      });
      this.checked = true;
    }
  }

  userJoinTo(room: string){
    this.socket.emit('userJoinTo', room);
    console.log('user has Join to: ', room);
    //return this.chanelWatcher();
  }

  chanelWatcher(): Observable <any>{
    let observable = new Observable(observer => {
        this.socket.on('chat room', (data: PrivateMessagesInterface) => {
            observer.next(data);
            console.log('lllooooooppppp', data);
        });
    });
    return observable;
  }

  sendPrivateMessage(privateMessage: PrivateMessagesInterface){
    this.socket.emit('newPrivateMessage', privateMessage);
  }

  createSubscriptionToChannel(room: string){
    //Save messages from socked.io, new_message
    this.messagesAndRooms.rooms[`${room}`] = [];
    this.userJoinTo(room);
    if(this.chanelOpen == false){

      this.arraySubscribersPrivateMessages = this.chanelWatcher()
      .subscribe(new_message => {
          this.messagesAndRooms.rooms[`${new_message.room}`].push(new_message);
          console.log('This is the firebase: ', this.messagesAndRooms);
      });
      this.chanelOpen = true;
    }
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
