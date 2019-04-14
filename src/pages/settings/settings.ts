import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DisclaimerAboutPage } from '../disclaimer-about/disclaimer-about'

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  /* Changes the page to either Disclaimer or About */
  public goToDisclaimerAbout(param){
  	this.navCtrl.push(DisclaimerAboutPage, {'value': param})
  }

}
