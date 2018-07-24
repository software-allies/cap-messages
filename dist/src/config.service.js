import { Injectable, Optional } from '@angular/core';
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
        { type: Injectable },
    ];
    /** @nocollapse */
    ConfigService.ctorParameters = function () { return [
        { type: ConfigService, decorators: [{ type: Optional },] },
    ]; };
    return ConfigService;
}());
export { ConfigService };
//# sourceMappingURL=config.service.js.map