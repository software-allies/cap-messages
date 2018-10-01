import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { AlertController } from 'ionic-angular';
import { UserDataInterface } from './userData.interface';
import { MessagesService } from '../../messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  template: 
  `
  <ion-header>

    <ion-navbar>
      <button ion-button menuToggle icon-only>
        <ion-icon name='menu'></ion-icon>
      </button>
      <ion-title>
        Register
      </ion-title>
    </ion-navbar>

  </ion-header>

  <ion-content>
    <form [formGroup]="registerForm" (ngSubmit)="onCreateUser()">
      <ion-list>

        <ion-item>
          <ion-label stacked>Username</ion-label>
          <ion-input type="text" formControlName="username" [(ngModel)]="userData.username" ngDefaultControl></ion-input>
        </ion-item>

        <ion-item>
          <ion-label stacked>Email</ion-label>
          <ion-input type="text" formControlName="email" [(ngModel)]="userData.email" ngDefaultControl></ion-input>
        </ion-item>

        <ion-item>
          <ion-label stacked>Avatar</ion-label>
          <ion-input type="text" formControlName="avatar" [(ngModel)]="userData.avatar" ngDefaultControl></ion-input>
        </ion-item>

        <ion-item>
          <ion-label stacked>Password</ion-label>
          <ion-input type="password" formControlName="password" [(ngModel)]="userData.password" ngDefaultControl></ion-input>
        </ion-item>

        <ion-item>
          <ion-label stacked>Confirm Password</ion-label>
          <ion-input type="password" formControlName="confirm_password" [(ngModel)]="confirm_password" ngDefaultControl></ion-input>
        </ion-item>

      </ion-list>
    
      <button ion-button color="primary" block [disabled]="!registerForm.valid">Sing Up</button>

    </form>
  </ion-content>
  `,
  styles: [`
    ion-content {
      margin-top: 20px;
    }
  `],
  encapsulation: ViewEncapsulation.Emulated
})
export class RegisterComponent implements OnInit {
  messageService: MessagesService;
  registerForm: FormGroup;
  userData: UserDataInterface = {
    username: '',
    email: '',
    avatar: '',
    password: ''
  };
  confirm_password = '';

  constructor(private formBuilder: FormBuilder, 
    public alertCtrl: AlertController) { 
  }

  ngOnInit(): any { 
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', Validators.compose([Validators.maxLength(70), Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$'), Validators.required])],
      avatar: ['', Validators.required],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required]
    });
  }

  onCreateUser(): any {
    if(this.userData.password !== this.confirm_password){
      const alert = this.alertCtrl.create({
        title: 'Wrong password!',
        subTitle: 'Passwords don\'t match.',
        buttons: ['OK']
      });
      alert.present();
    }else {
      const alert = this.alertCtrl.create({
        title: 'Nice!',
        subTitle: 'Account successfully created.',
        buttons: ['OK']
      });
      console.log(this.userData);
      // this.messageService.saveUsersToDB(this.userData)
      //   .subscribe(result => {
      //       console.log('onSubmit result', result);
      // });
      alert.present();
    }
  }

}
