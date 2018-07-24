import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule } from "@angular/common";
import { IonicModule } from 'ionic-angular';

import { ConfigService } from './config.service';
import { MessagesService } from './messages.service';
import { MessagesComponent } from './components/messages/messages.component';

@NgModule({
  declarations: [
    MessagesComponent,
  ],
  imports: [
    IonicModule,
    HttpClientModule,
    ReactiveFormsModule,
    CommonModule
  ],
  exports: [
    HttpClientModule,
    ReactiveFormsModule,
    CommonModule,
    MessagesComponent
  ],
  providers: [
    MessagesService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class MessagesModule {

    static forRoot(config: ConfigService): ModuleWithProviders {
        return {
            ngModule: MessagesModule,
            providers: [
                {
                    provide: ConfigService, 
                    useValue: config 
                }
            ]
        };
    }

}

