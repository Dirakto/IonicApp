import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { sha256 } from 'js-sha256';
import { Http } from '@angular/http';
import { DbProvider } from '../../providers/db/db';
import { Storage } from '@ionic/storage';
import { FavouritesProvider } from '../../providers/favourites/favourites';

@IonicPage()
@Component({
  selector: 'page-loging',
  templateUrl: 'loging.html',
})
export class LogingPage {

	credentialsForm: FormGroup; 
  isValid: boolean = true;  // additional field to check if the form is valid
  additionalErrors = 0;     // sets an additional error message to display (not part of form validators)
  validation_msg = {        // set of validation errors' messages
    'email' : [
      {type: 'required', message: 'Email required'},
      {type: 'maxlength', message: 'Maximan length is 70 characters'},
      {type: 'pattern', message: 'Incorrect email address'}
    ],
    'password':[
      {type: 'required', message: 'Password required'},
      {type: 'maxlength', message: 'Maximum length is 30 characters'},
      {type: 'minlength', message: 'At least 6 characters required'},
      {type: 'pattern', message: 'Password must include at least one number, one big letter and one special sign (!@#$%^&)'}
    ],
    'password2':[
      {type: 'required', message: 'Type in your password again'}
    ]
  };

	isLogged: boolean = false;     // Renders either logging/registering form or logged 'label'
	username: String = null;       // Saves email after logging

	isSigningIn: boolean = false;  //shows SignIn panel if the user pressed 'Sign in' button

	isReady: boolean = false;      // waits with rendering until storage retrieves data
	isLoading: boolean = false;    // shows spinner when awaiting data from server

  /*  Constructor ->
      *checks if user is logged and sets username, isLogged and isReady fields
      *createw formGroup with input validators
  */
  constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, public http: Http,
              public dbProvider: DbProvider, public storage: Storage, public favProvider: FavouritesProvider){
  	this.storage.get('username').then(data =>{
    		if(data){
    			this.isLogged = true;
    			this.username = data;
    		}
    		this.isReady = true;
  	});

  	this.credentialsForm = this.formBuilder.group({
  		email: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(70),
        Validators.pattern(new RegExp("^(([^<>()\\[\\]\\.,;:\\s@\"]+(\\.[^<>()\\[\\]\\.,;:\\s@\"]+)*)|(\".+\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$"))
        ])],
  		password: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(30),
        Validators.minLength(6),
        Validators.pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])"))
        ])],
  		password2: ['', Validators.required]
  	});
  }

  /* Checks if email and password inputs are valid - if not the password is cleared and a proper error is displayed.
     If inputs are valid, the logging process begins:
     *application sends inputs to server to check their conformence with the database
     *if they are correct, email and password are saved in application storage, form is reset
      and the view is switched (form is hiddem and logged 'label' is visible)
     *if the inputs don't match database, an appropriate error is raised and the form is reset
      */
  public logIn(){
    if(!this.credentialsForm.controls['email'].valid || !this.credentialsForm.controls['password'].valid){
      this.isValid = false;
      this.credentialsForm.controls['password'].reset();
      this.credentialsForm.controls['password'].setErrors(null);
      this.setError(6);
      return;
    }

    this.isValid = true;
  	this.isLoading = true;
    this.additionalErrors = 0;

  	var array = this.getDataFromForm();
  	this.dbProvider.sendToDb('login', array[0]+':'+sha256(array[1]), 7000).then(data => {
  		if(data === 1){
  			this.isLogged = true;
  			this.username = array[0];
  			this.storage.set('username', array[0]);
        this.storage.set('password', sha256(array[1]));
        this.favProvider.addLoggedData(array[0], sha256(array[1]));
  		}else{
  			this.setError(3);
  		}
  		this.isLoading = false;
  		this.credentialsForm.reset();
  	}).catch(err => { this.isLoading = false; this.setError(4); });
  }

  /* Displays 'Password Confirmation' input and switches to registering (isSigningIn) */
  public signIn(){
  	this.isSigningIn = true;
    this.additionalErrors = 0;
  }

  /* Checks if the inputs are valid.
     If they are valid, it checks if the Confirmation Password matches Password.
     If there is a match, it sends data to the server, otherwise dislays an appropriate error.
     If such user already exists, an appropriate error is raised, otherwise
      informs that a message was sent to the given email address.
     Resets the form and switches view from registering to logging.
     While it awaits server replies it displays the spinner
  */
  public saveAccount(){
    if(!this.credentialsForm.controls['email'].valid || !this.credentialsForm.controls['password'].valid || !this.credentialsForm.controls['password2'].valid){
      this.isValid = false;
      return
    }

    this.isValid = true;
  	this.isLoading = true;

  	var array = this.getDataFromForm();
  	if(array[1]===array[2]){
      this.additionalErrors = 0;
  		this.dbProvider.sendToDb('addUser', (array[0]+':'+sha256(array[1])), 7000 ).then(data=>{
    			if( data ){
  			  	this.isSigningIn = false;
            this.setError(5);
  		  	}else{
            this.setError(2);
  		  	}
  		  	this.isLoading = false;
  		}).catch(err => { this.isLoading = false; this.setError(4); });
  	}else{
      this.isLoading = false;
      this.setError(1);
    }

  	this.credentialsForm.reset();
  }

  /* Clears form and switches back to logging view */
  public cancelSaving(){
  	this.credentialsForm.reset();
  	this.isSigningIn = false;
    this.additionalErrors = 0;
  }

  /* Logs out the user and clears email and password from application's storage.
     Additionally it removes the favourites books which were downloaded from the logged user's database
   */
  public logout(){
  	this.isLogged = false;
  	this.username = null;
  	this.storage.remove('username');
    this.storage.remove('password');
    this.favProvider.deleteLoggedUserData();
  }

  /* Displays error based on the argument for 4s, then hides it */
  public setError(i: number){
    this.additionalErrors = i;
    var self = this;
    setTimeout(function(){
      self.additionalErrors = 0;
    },4000);
  }

  /* Obtains inputs' values and returns them as an array */
  public getDataFromForm(){
    var email = this.credentialsForm.value['email'];
    var pass = this.credentialsForm.value['password'];
    var passConfirmation = this.credentialsForm.value['password2'];
    return [email, pass, passConfirmation];
  }

}
