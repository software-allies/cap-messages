import { Injectable, Optional } from '@angular/core';

/*{
    providedIn:  'root'
}*/

@Injectable()
export class ConfigService {

    wsUrl: string;
    apiUrl: string;

    constructor(@Optional() config: ConfigService) {
        if (config) { 
            this.wsUrl = config.wsUrl;
            this.apiUrl = config.apiUrl;
        }
    }

}