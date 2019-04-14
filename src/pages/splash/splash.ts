import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';

/**
 * Generated class for the SplashPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-splash',
  templateUrl: 'splash.html',
})
export class SplashPage{

  isReady: String = "hide";  // hides the content until the image is fully loaded

  /* Constructor ->
     *switched pages after a set interval
   */
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  	setTimeout(function(){
  		navCtrl.push(HomePage, {}, {animate: false});
  	}, 3000);
  }

  /* Method fired when the image is fully loaded. Sets the content as ready to be presented */
  public show(){
    this.isReady = '';
  }

}
