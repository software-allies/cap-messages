import { Component, Output, EventEmitter, ViewEncapsulation, ViewChild, OnInit } from '@angular/core'; 
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MessagesService } from '../../messages.service';
import { UserInterface } from '../../user.interface';
import { MessageInterface } from '../../message.interface';
import { PrivateMessagesInterface } from '../../privateMessages.interface';
import { Subscription } from 'rxjs';
import { NavController, NavParams, ModalController, ViewController, Content } from 'ionic-angular';
import { RegisterComponent } from '../register/register.component';

@Component({
    selector: "msg-app",
    styles: [`
        .tool-bar{
            position: fixed;
            top: 55px;
        }
    `],
    template: 
    `
    <ion-header [className]="'tool-bar'">
        <ion-toolbar>
            <ion-title *ngIf="logged === true">Send a message to...</ion-title>
            <ion-title *ngIf="logged === false">Login...</ion-title>            
            <ion-buttons end>
                <button ion-button icon-only color="royal" *ngIf="logged === true" (click)="lookPerson()">
                    <ion-icon color="primary" name="chatboxes"></ion-icon>
                </button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>

    <ion-content no-padding style="margin-top: -18px;">
        <ion-grid>
            <ion-row *ngIf="logged === false" align-items: center>
                <ion-col col-12 col-xl-8 offset-xl-2 col-lg-10>
                    <form [formGroup]="loginForm" (ngSubmit)="onCreateUser()">
                        <ion-list>
                            <ion-item>
                                <ion-label stacked>Username</ion-label>
                                <ion-input type="text" block [(ngModel)]="userLogged.username" formControlName="username" ngDefaultControl></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-label stacked>Avatar</ion-label>
                                <ion-input type="text" block [(ngModel)]="userLogged.avatar" formControlName="avatar" ngDefaultControl></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-label stacked>Status</ion-label>
                                <ion-input type="text" block [(ngModel)]="userLogged.status" formControlName="status" ngDefaultControl></ion-input>
                            </ion-item>

                        </ion-list>
                        <button ion-button type="submit" block [disabled]="!loginForm.valid">Sign In</button>
                        </form>
                        <button ion-button color="light" block (click)="registerUser()">Register</button>
                </ion-col>
            </ion-row>

            <ion-row *ngIf="logged  === true" align-items: center>
                <ion-col col-12 col-xl-8 offset-xl-2 col-lg-10>
                    <ion-list>
                        <ion-item *ngFor="let _message of _messages">
                            <strong>{{_message.nickname}}</strong>: <span text-wrap> {{_message.message}} </span>
                        </ion-item>
                    </ion-list>

                    <ion-list>
                        <form [formGroup]="messagesform" (ngSubmit)="onSubmit()">
                            <ion-item>
                                <ion-label stacked primary>Message</ion-label>
                                <ion-input [(ngModel)]="message.message" formControlName="message" type="text" id="message" ngDefaultControl>
                                </ion-input>
                            </ion-item>

                            <button ion-button type="submit" block primary [disabled]="!messagesform.valid">Send</button>

                        </form>
                    </ion-list>
                </ion-col>
        </ion-row>
        </ion-grid>
    </ion-content>
    `,
    encapsulation: ViewEncapsulation.Emulated
})

export class MessagesComponent {
    @ViewChild(Content) content: Content;
    messagesform: FormGroup;
    loginForm: FormGroup;
    offStatus:boolean = false;
    _messages: any[] = [];
    _users: UserInterface[] = [];
    myID: string;
    socket: any;
    subscribeMessages: Subscription = new Subscription;
    subscribeUsers: Subscription = new Subscription;
    subscribeId: Subscription = new Subscription;
    logged = false;
    

    @Output()
    send: EventEmitter<any> = new EventEmitter();

    userLogged: UserInterface = {
        username: '',
        avatar: '',
        status: ''
    };

    message: MessageInterface = { 
        nickname: '', 
        message: '' 
    };

    constructor(
        private messageService: MessagesService,
        private formBuilder: FormBuilder, 
        private navCtrl: NavController) {
        
        this.socket = this.messageService.getSocketObject();
    }

    ngOnInit(): any {

        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            avatar: ['', Validators.required],
            status: ['', Validators.required]
        });

        this.messagesform = this.formBuilder.group({
            message: ['', Validators.required]
        });

        //Gets the messages from loopback
        this.messageService.getMessages()
            .subscribe(result => {
                this._messages = result;
            });
        //Save messages from socked.io, new_message
        this.subscribeMessages = this.messageService.newMessage()
            .subscribe(new_message => {
                this._messages.push(new_message);
            });

        //Save users
        this.subscribeUsers = this.messageService.getUsers()
            .subscribe(users => {
                this._users = users;
                console.log(this._users);
            });
        //This works to get the user id
        this.subscribeId = this.messageService.getUserId()
        .subscribe(id => {
            this.myID = id;
        });
        //Add all the rooms
        this.messageService.receiveRooms();
    }

    scrollDown(){
        setTimeout(() => {
            if(this.offStatus === false){
                this.content.scrollToBottom(300);
            }
        }, 850);
    }

    //This sends the messages to socked.io and loopback
    onSubmit() {
        this.messageService.sendMessage(this.message);

        this.messageService.saveToDB(this.message)
        .subscribe(result => {
            console.log('onSubmit result', result);
        });
        this.message.message = '';
    }

    login() {
        this.logged = true;
    }

    registerUser() {
        this.navCtrl.push(RegisterComponent);
    }

    onCreateUser() {
        this.userLogged.id = this.myID;
        this.messageService.newUser(this.userLogged);
        this.logged = true;
        this.message.nickname = this.userLogged.username;
        this.scrollDown();
        // this.messageService.loginUser(this.userData)
        // .subscribe(result => {
        //     console.log("user login: ", result);
        //     this.userInformation = result;
        // });
        // this.messageService.getUserInformation({userId: this.userInformation.id, id: this.userInformation.id})
        //     .subscribe(result => {
        //         console.log("user data: ", result);
        // });
        //this.message.nickname = 'Static';
    }


    lookPerson() {
        console.log('This is my id', this.myID);
        this.navCtrl.push(MessagesContactPage, { users: JSON.stringify(this._users), userLogged: this.userLogged });
        this.subscribeId.unsubscribe();
    }

    getUsers() {
        return this._users;
    }

    ngOnDestroy() {
        this.subscribeMessages.unsubscribe();
        this.subscribeUsers.unsubscribe();
        this.subscribeId.unsubscribe();
    }

}

@Component({
    selector: 'messages-contact-page',
    styles: [`
    `],
    template: `
  <ion-header>

    <ion-navbar>
      <button ion-button menuToggle icon-only>
        <ion-icon name='menu'></ion-icon>
      </button>
      <ion-title>
        Users connected
      </ion-title>
    </ion-navbar>

  </ion-header>

  <ion-content padding-right>

    <ion-list style="margin-left: 0px;">
        <ion-card *ngFor="let user of users" (click)="presentModal(user)">
            <button ion-item>
                <ion-item style="background: rgba(0,0,0,0);">
                    <ion-avatar item-start>
                        <img [src]="user.avatar">
                    </ion-avatar>
                    <h2>{{ user.username }}</h2>
                    <p>{{ user.status }}</p>
                </ion-item>
            </button>
        </ion-card>
    </ion-list>
    </ion-content>
  `
  })
export class MessagesContactPage { 

    users: UserInterface;
    userLogged: UserInterface;
    // 
    constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        public modalCtrl: ModalController,) 
    {
        this.users = JSON.parse(navParams.get('users'));
        this.userLogged = navParams.get('userLogged');
        console.log('Users Array: ', this.users);
        console.log('this user logged: ', this.userLogged);
    }

    presentModal(user: string) {
        const modal = this.modalCtrl.create(PrivateMessageModal, {
            to: user,
            from: this.userLogged 
        });
        modal.present();
    }
    
}


@Component({
    selector: 'modal-message',
    styles: [`
        .private-message{
            display:inline-block;
        }
        
        .private-message-img{
            width: 35px;
            height: 35px;
            border-radius: 50%;
        }
        .ion-item-header{
            background: rgba(0,0,0,0); 
            margin-top: -5px; 
            margin-bottom: -7px;
        }
        .private-message-input{
            background-color: #F5F5F5;
            border-radius: 25px;
        }
        .private-message-footer{
            display: block;
        }
    `],
    template: `

    <ion-header>
        <ion-toolbar>
            <ion-item class="ion-item-header" no-lines>
                <ion-avatar item-start>
                    <img [src]="receiver.avatar">
                </ion-avatar>
                <h2 style="font-size: 20px">{{ receiver.username }}</h2>
            </ion-item>
                
            <ion-buttons end>
                <button ion-button color="primary" (click)="dismiss()">
                    Close
                </button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>

    <ion-content padding-right>

        <ion-card>
            <button ion-item>
                <ion-item style="background: rgba(0,0,0,0);">
                    <ion-avatar item-start>
                        <img [src]="receiver.avatar">
                    </ion-avatar>
                    <h2>{{ receiver.username }}</h2>
                    <p>{{ receiver.status }}</p>
                </ion-item>
            </button>
        </ion-card>

        <ion-list>
            <ion-item *ngFor="let _message of private_messages">
                <strong>{{_message.nickname}}</strong>: <span text-wrap> {{_message.message}} </span>
            </ion-item>
        </ion-list>

    </ion-content>

    <ion-footer class="private-message-footer">
        <ion-grid>
            <form [formGroup]="privateFormGroup" (ngSubmit)="onSubmitPrivateMessage()">
                <ion-row>
                    <ion-col col-10>
                        <ion-input class="private-message-input" type="text" placeholder="Type a message" [(ngModel)]="privateMessage"
                            formControlName="privateMessage" id="privateMessage" ngDefaultControl></ion-input>
                    </ion-col>
                    <ion-col col-2>
                        <ion-buttons end>
                        <button ion-button>
                            <ion-icon name="md-send"></ion-icon>
                        </button>
                        </ion-buttons>
                    </ion-col>
                </ion-row>
            </form>
        </ion-grid>
    </ion-footer>

    `
})
export class PrivateMessageModal implements OnInit {
    receiver: UserInterface;
    userLogged: UserInterface;
    privateMessage: string;
    privateFormGroup: FormGroup;
    private_messages: PrivateMessagesInterface[] = [];
    messagesLoading = true;
    roomsArray = ['rooms'];

    message: PrivateMessagesInterface = {
        room: '',
        message: '',
        idFrom: '',
        idTo: ''
    };

    constructor(
        public navParams: NavParams, 
        public viewCtrl: ViewController,
        public formBuilder: FormBuilder,
        private messageService: MessagesService) {
            this.receiver = this.navParams.get('to');
            console.log('To: ', this.receiver);
            this.userLogged = this.navParams.get('from');
            console.log('From: ', this.userLogged);
            this.checkRoom(this.userLogged.username, this.receiver.username);
            console.log('Rooms available: ', this.messageService.localArrayRooms);
    }

    ngOnInit(): any{
        this.privateFormGroup = this.formBuilder.group({
            privateMessage:['', Validators.required]
        });

        // Not used at this point
        this.messageService.getRooms()
            .subscribe(result => {
                this.roomsArray = result;
                //console.log('These are the rooms available: ', this.roomsArray);
            });
        this.message.idTo = this.receiver.username;
        this.message.idFrom = this.userLogged.username;
        this.message.idSockedTo = this.receiver.id;
        this.message.idSockedFrom = this.userLogged.id;
        this.messageService.sendPrivateInvitation(this.message);

    }

    onSubmitPrivateMessage(){
        this.message.message = this.privateMessage;
        this.messageService.savePrivateMessageToDB(this.message)
        .subscribe(result => {
            console.log('onSubmitPrivate result', result);
        });
        this.privateMessage = '';
    }

    checkRoom(sender: string, receiver: string){
        let formatRoom = `${sender}&${receiver}`;
        if(typeof this.messageService.localArrayRooms !== 'undefined' && this.messageService.localArrayRooms.length > 0){
            if(this.messageService.localArrayRooms.indexOf(formatRoom) >= 0) {
                console.log('f1');
                this.message.room = formatRoom;
            }else if(this.messageService.localArrayRooms.indexOf(`${receiver}&${sender}`) >= 0){
                this.message.room = `${receiver}&${sender}`;
                console.log('f2');
            }else {
                console.log('f3');
                this.message.room = formatRoom;
                this.messageService.localArrayRooms.push(this.message.room);
                console.log('saved', this.messageService.localArrayRooms);
                this.messageService.userJoinTo(this.message.room);
            }
        }else{
            console.log('f4');
            this.message.room = formatRoom;
            this.messageService.localArrayRooms.push(this.message.room);
            console.log('saved', this.messageService.localArrayRooms);
            this.messageService.userJoinTo(this.message.room);
        }
        //Create a new room in the data base and add it to the roomArray
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

}
