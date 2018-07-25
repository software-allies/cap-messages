import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ConfigService } from './config.service';
import * as io from 'socket.io-client';
var MessagesService = /** @class */ (function () {
    function MessagesService(configService, _http) {
        this.configService = configService;
        this._http = _http;
        this.socket = io(configService.wsUrl);
        this.headers = new HttpHeaders();
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
        return new Observable(function (observer) {
            _this.observerMessage = observer;
        });
    };
    MessagesService.prototype.handleError = function (error) {
        console.error('server error:', error);
        if (error.error instanceof Error) {
            var errMessage = error.error.message;
            return Observable.throw(errMessage);
        }
        return Observable.throw(error || 'Socket.io server error');
    };
    MessagesService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MessagesService.ctorParameters = function () { return [
        { type: ConfigService, },
        { type: HttpClient, },
    ]; };
    return MessagesService;
}());
export { MessagesService };
//# sourceMappingURL=messages.service.js.map