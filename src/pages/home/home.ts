import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SplashPage } from '../splash/splash';
import { SettingsPage } from '../settings/settings';
import { SearchSideBarPage } from '../search-side-bar/search-side-bar';
import { FavouritePage } from '../favourite/favourite';
import { FavouritesProvider } from '../../providers/favourites/favourites';


/*  interfaces declared globaly*/
declare global{
  /* Creating a global interface representing books' covers */
  interface Books{
    id: number;
    name:string;
    cover:string;
  }

  /*  Special interface representing book's information */
 interface Book{
    id: number;
    name: string;
    author: string;
    year: string;
    description: string;
    cover: string;
    category: number;
 }
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  constructor(public navCtrl: NavController, public favProvider: FavouritesProvider) {}

  /* Initializes the download of favourite books */
  ionViewDidLoad(){
    this.favProvider.initiateFavourites();
  }

  /* Methods for switching between pages */

  public goToSearch(){
    this.navCtrl.push(SearchSideBarPage, {nav: this.navCtrl}, {animate:true, animation:'transition', duration:500, direction: 'back'});
  }

  public goToFavourite(){
    this.navCtrl.push(FavouritePage);
  }

  public goToSplash(){
  	this.navCtrl.push(SplashPage);
  }

  public goToSettings(){
  	this.navCtrl.push(SettingsPage);
  }

}
