import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the DisclaimerAboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-disclaimer-about',
  templateUrl: 'disclaimer-about.html',
})
export class DisclaimerAboutPage {

  isDisclaimer: boolean; // describes which button was pressed (About or Disclaimer) to show the proper page

  /* Constructor -> 
  	 *sets up isDisclaimer
  */
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  	this.isDisclaimer = this.navParams.get('value');
  }

}
