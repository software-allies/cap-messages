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
  arrayOther :any = [{}];
  arraySubscribersPrivateMessages: Subscription = new Subscription;
  messagesAndRooms: any = { rooms: {} };

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
    // this.arrayOther = jsonObj.rooms['victor'];
    // for(let i = 0; i < this.arrayOther.length; i++){
    //   console.log(this.arrayOther[i].message);
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
  
  getMessages() : Observable<string[]> {
      //Here gets the messages from loopback
      //io.connect();
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

  getPrivateMessages(room: any) : Observable<any[]> {
    //Here gets the messages from loopback
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
              console.log(this.localArrayRooms);
          }
        }else{
          this.localArrayRooms.push(data);
          this.createSubscriptionToChannel(data);
          console.log('empty', this.localArrayRooms);
        }
      });
      this.checked = true;
    }
  }

  userJoinTo(room: string): Observable<any>{
    this.socket.emit('userJoinTo', room);
    console.log('user has Join to: ', room);
    return this.chanelWatcher();
  }

  chanelWatcher(): Observable <any>{
    let observable = new Observable(observer => {
      this.socket.on('chat room', (data: PrivateMessagesInterface) => {
          observer.next(data);
          console.log('lllooooooppppp');
          //this.scrollDown();
          // try {
          //   setTimeout(() => {
          //     this.PrivateMessageModal.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
          //   }, 100);
          // } catch (error) {
          //   console.warn(error);
          // }
      });
    });
    return observable;
  }

  // scrollDown(){
  //   setTimeout(() => {
  //           PrivateMessageModal.prototype.content.ionScrollEnd;
  //   }, 850);
  // }

  sendPrivateMessage(privateMessage: PrivateMessagesInterface){
    this.socket.emit('newPrivateMessage', privateMessage);
    console.log(`Private message: ${privateMessage.room}: `, privateMessage);
  }

  createSubscriptionToChannel(room: string){
    //Save messages from socked.io, new_message
    this.messagesAndRooms.rooms[`${room}`] = [];
    this.arraySubscribersPrivateMessages.add(this.userJoinTo(room)
    .subscribe(new_message => {
        this.messagesAndRooms.rooms[`${room}`].push(new_message);
        console.log('This is the firebase: ', this.messagesAndRooms);
    }));
  }

  // Not finished and may be not needed
  // newMessagePrivate(): Observable<any>{
  //   let observable = new Observable(observer => {
  //       this.socket.on('new message', (data: MessageInterface) => {
  //           observer.next(data);
  //       });
  //   });
  //   return observable;
  // }

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
