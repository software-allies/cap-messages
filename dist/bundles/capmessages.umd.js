(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common/http'), require('rxjs/Observable'), require('socket.io-client'), require('@angular/forms'), require('@angular/common'), require('ionic-angular')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common/http', 'rxjs/Observable', 'socket.io-client', '@angular/forms', '@angular/common', 'ionic-angular'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.capmessages = {}),global.ng.core,null,null,null,null,null,null));
}(this, (function (exports,core,http,Observable,io,forms,common,ionicAngular) { 'use strict';

    var io__default = 'default' in io ? io['default'] : io;

    /*{
        providedIn:  'root'
    }*/
    var ConfigService = /** @class */ (function () {
        function ConfigService(config) {
            if (config) {
                this.wsUrl = config.wsUrl;
                this.wsUrl = config.apiUrl;
            }
        }
        ConfigService.decorators = [
            { type: core.Injectable },
        ];
        /** @nocollapse */
        ConfigService.ctorParameters = function () { return [
            { type: ConfigService, decorators: [{ type: core.Optional },] },
        ]; };
        return ConfigService;
    }());

    // Esto es un hack para que funcione rollup
    var ioFunc = io__default ? io__default : io;
    var MessagesService = /** @class */ (function () {
        function MessagesService(configService, _http) {
            this.configService = configService;
            this._http = _http;
            // Después de aplicar hack se cambio de (socketIo a ioFunc)
            this.socket = ioFunc(configService.wsUrl);
            this.headers = new http.HttpHeaders();
            this.headers.set("Content-Type", "application/json; charset=UTF-8");
            this.headers.set('Authentication', localStorage.getItem('_token') || '');
            this.apiUrl = configService.apiUrl;
        }
        MessagesService.prototype.sendMessage = function (message) {
            this.socket.emit('clientmessage', message);
            return this._http.post(this.apiUrl + "messages", message, { headers: this.headers })
                .map(function (response) { return response; })
                .catch(this.handleError);
        };
        MessagesService.prototype.getMessages = function () {
            return this._http.get(this.apiUrl + "messages", { headers: this.headers })
                .map(function (response) { return response; })
                .catch(this.handleError);
        };
        MessagesService.prototype.subscribeMessages = function () {
            var _this = this;
            this.socket.on('message', function (res) {
                _this.observerMessage.next(res.msg);
            });
            this.socket.emit('clientdata', 'Joined to chat');
            return this.createObservableString();
        };
        MessagesService.prototype.createObservableString = function () {
            var _this = this;
            return new Observable.Observable(function (observer) {
                _this.observerMessage = observer;
            });
        };
        MessagesService.prototype.handleError = function (error) {
            console.error('server error:', error);
            if (error.error instanceof Error) {
                var errMessage = error.error.message;
                return Observable.Observable.throw(errMessage);
            }
            return Observable.Observable.throw(error || 'Socket.io server error');
        };
        MessagesService.decorators = [
            { type: core.Injectable },
        ];
        /** @nocollapse */
        MessagesService.ctorParameters = function () { return [
            { type: ConfigService, },
            { type: http.HttpClient, },
        ]; };
        return MessagesService;
    }());

    var MessagesComponent = /** @class */ (function () {
        function MessagesComponent(messageService, formBuilder) {
            this.messageService = messageService;
            this.formBuilder = formBuilder;
            this._messages = [];
            this.send = new core.EventEmitter();
            this.message = {
                nickname: '',
                message: ''
            };
        }
        MessagesComponent.prototype.ngOnInit = function () {
            var _this = this;
            this.messagesform = this.formBuilder.group({
                nickname: ['', [forms.Validators.required, forms.Validators.minLength(3)]],
                message: ['', forms.Validators.required]
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
            { type: core.Component, args: [{
                        selector: "msg-app",
                        template: "\n<ion-grid>\n   <ion-row>\n     <ion-col  col-12 col-xl-8 offset-xl-2 col-lg-10 offset-lg-1>\n        <ion-list>\n            <ion-item *ngFor=\"let _message of _messages\">\n                <strong>{{_message.nickname}}</strong>: {{_message.message}}\n            </ion-item>\n        </ion-list>\n\n        <ion-list>\n            <form [formGroup]=\"messagesform\" (ngSubmit)=\"onSubmit()\">\n\n            <ion-item>\n                <ion-label stacked primary>Nickname</ion-label>\n                <ion-input [(ngModel)]=\"message.nickname\" formControlName=\"nickname\"\n                        type=\"text\" id=\"nickname\" spellcheck=\"false\" autocapitalize=\"off\" ngDefaultControl>\n                </ion-input>\n            </ion-item>\n            <ion-item>\n                <ion-label stacked primary>Message</ion-label>\n                <ion-input [(ngModel)]=\"message.message\" formControlName=\"message\" type=\"text\" id=\"message\" ngDefaultControl>\n                </ion-input>\n            </ion-item>\n\n            <button ion-button type=\"submit\" block primary [disabled]=\"!messagesform.valid\">Send</button>\n\n            </form>\n        </ion-list>\n     </ion-col>\n   </ion-row>\n </ion-grid>\n        ",
                        styles: [""],
                        encapsulation: core.ViewEncapsulation.Emulated
                    },] },
        ];
        /** @nocollapse */
        MessagesComponent.ctorParameters = function () { return [
            { type: MessagesService, },
            { type: forms.FormBuilder, },
        ]; };
        MessagesComponent.propDecorators = {
            "send": [{ type: core.Output },],
        };
        return MessagesComponent;
    }());

    var MessagesModule = /** @class */ (function () {
        function MessagesModule() {
        }
        MessagesModule.forRoot = function (config) {
            return {
                ngModule: MessagesModule,
                providers: [
                    {
                        provide: ConfigService,
                        useValue: config
                    }
                ]
            };
        };
        MessagesModule.decorators = [
            { type: core.NgModule, args: [{
                        declarations: [
                            MessagesComponent,
                        ],
                        imports: [
                            ionicAngular.IonicModule,
                            http.HttpClientModule,
                            forms.ReactiveFormsModule,
                            common.CommonModule
                        ],
                        exports: [
                            http.HttpClientModule,
                            forms.ReactiveFormsModule,
                            common.CommonModule,
                            MessagesComponent
                        ],
                        providers: [
                            MessagesService
                        ],
                        schemas: [
                            core.CUSTOM_ELEMENTS_SCHEMA
                        ]
                    },] },
        ];
        return MessagesModule;
    }());

    exports.MessagesModule = MessagesModule;
    exports.MessagesService = MessagesService;
    exports.MessagesComponent = MessagesComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
