import { Component, Output, EventEmitter, ViewEncapsulation } from '@angular/core'; 
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { MessagesService } from '../../messages.service';
import { MessageInterface } from '../../message.interface';
import { Subscription } from 'rxjs';


@Component({
    selector: "msg-app",
    template: `

        <ion-list>
            <ion-item *ngFor="let _message of _messages">
                <strong>{{_message.nickname}}</strong>: {{_message.message}}
            </ion-item>
        </ion-list>

        <ion-list>
            <form [formGroup]="messagesform" (ngSubmit)="onSubmit()">

            <ion-item>
                <ion-label stacked primary>Nickname</ion-label>
                <ion-input [(ngModel)]="message.nickname" formControlName="nickname"
                        type="text" id="nickname" spellcheck="false" autocapitalize="off" ngDefaultControl>
                </ion-input>
            </ion-item>
            <ion-item>
                <ion-label stacked primary>Message</ion-label>
                <ion-input [(ngModel)]="message.message" formControlName="message" type="text" id="message" ngDefaultControl>
                </ion-input>
            </ion-item>

            <button ion-button type="submit" block primary [disabled]="!messagesform.valid">Send</button>

            </form>
        </ion-list>
        `,
    styles: [``],
  encapsulation: ViewEncapsulation.Emulated
})
export class MessagesComponent {
    
    _messages: string[] = [];
    sub: Subscription;

    @Output()
    send: EventEmitter<any> = new EventEmitter();

    message: MessageInterface = { 
        nickname: '', 
        message: '' 
    };

    messagesform: FormGroup;

    constructor(
        private messageService: MessagesService,
        public formBuilder: FormBuilder) {
    }

    ngOnInit(): any {
        this.messagesform = this.formBuilder.group({
            nickname: ['', [Validators.required, Validators.minLength(3)]],
            message: ['', Validators.required]
        });

        this.messageService.getMessages()
            .subscribe(result => {
                this._messages = result;
            });

        this.sub = this.messageService.subscribeMessages()
            .subscribe(message => {
                console.log('message', message);
                this._messages.push(message);
            });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    onSubmit() {
        this.messageService.sendMessage(this.message)
            .subscribe(result => {
                console.log('onSubmit result', result);
            });
        this.message.message = '';
        // this.send.emit(this.message);
    }


}

