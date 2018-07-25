import { Component, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { MessagesService } from '../../messages.service';
var MessagesComponent = /** @class */ (function () {
    function MessagesComponent(messageService, formBuilder) {
        this.messageService = messageService;
        this.formBuilder = formBuilder;
        this._messages = [];
        this.send = new EventEmitter();
        this.message = {
            nickname: '',
            message: ''
        };
    }
    MessagesComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.messagesform = this.formBuilder.group({
            nickname: ['', [Validators.required, Validators.minLength(3)]],
            message: ['', Validators.required]
        });
        this.messageService.getMessages()
            .subscribe(function (result) {
            _this._messages = result;
        });
        this.sub = this.messageService.subscribeMessages()
            .subscribe(function (message) {
            console.log('message', message);
            _this._messages.push(message);
        });
    };
    MessagesComponent.prototype.ngOnDestroy = function () {
        this.sub.unsubscribe();
    };
    MessagesComponent.prototype.onSubmit = function () {
        this.messageService.sendMessage(this.message)
            .subscribe(function (result) {
            console.log('onSubmit result', result);
        });
        this.message.message = '';
        // this.send.emit(this.message);
    };
    MessagesComponent.decorators = [
        { type: Component, args: [{
                    selector: "msg-app",
                    template: "\n<ion-grid>\n   <ion-row>\n     <ion-col  col-12 col-xl-8 offset-xl-2 col-lg-10 offset-lg-1>\n        <ion-list>\n            <ion-item *ngFor=\"let _message of _messages\">\n                <strong>{{_message.nickname}}</strong>: {{_message.message}}\n            </ion-item>\n        </ion-list>\n\n        <ion-list>\n            <form [formGroup]=\"messagesform\" (ngSubmit)=\"onSubmit()\">\n\n            <ion-item>\n                <ion-label stacked primary>Nickname</ion-label>\n                <ion-input [(ngModel)]=\"message.nickname\" formControlName=\"nickname\"\n                        type=\"text\" id=\"nickname\" spellcheck=\"false\" autocapitalize=\"off\" ngDefaultControl>\n                </ion-input>\n            </ion-item>\n            <ion-item>\n                <ion-label stacked primary>Message</ion-label>\n                <ion-input [(ngModel)]=\"message.message\" formControlName=\"message\" type=\"text\" id=\"message\" ngDefaultControl>\n                </ion-input>\n            </ion-item>\n\n            <button ion-button type=\"submit\" block primary [disabled]=\"!messagesform.valid\">Send</button>\n\n            </form>\n        </ion-list>\n     </ion-col>\n   </ion-row>\n </ion-grid>\n        ",
                    styles: [""],
                    encapsulation: ViewEncapsulation.Emulated
                },] },
    ];
    /** @nocollapse */
    MessagesComponent.ctorParameters = function () { return [
        { type: MessagesService, },
        { type: FormBuilder, },
    ]; };
    MessagesComponent.propDecorators = {
        "send": [{ type: Output },],
    };
    return MessagesComponent;
}());
export { MessagesComponent };
//# sourceMappingURL=messages.component.js.map