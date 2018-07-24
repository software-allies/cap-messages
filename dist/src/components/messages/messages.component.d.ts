import { EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from "@angular/forms";
import { MessagesService } from '../../messages.service';
import { MessageInterface } from '../../message.interface';
import { Subscription } from 'rxjs';
export declare class MessagesComponent {
    private messageService;
    formBuilder: FormBuilder;
    _messages: string[];
    sub: Subscription;
    send: EventEmitter<any>;
    message: MessageInterface;
    messagesform: FormGroup;
    constructor(messageService: MessagesService, formBuilder: FormBuilder);
    ngOnInit(): any;
    ngOnDestroy(): void;
    onSubmit(): void;
}
