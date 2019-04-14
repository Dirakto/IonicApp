import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SearchPage } from '../search/search';
import { MenuController } from 'ionic-angular';
import { DbProvider } from '../../providers/db/db';
import { Events } from 'ionic-angular';

/**
 * Generated class for the SearchSideBarPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

/* Creates an interface representing categories */
 interface Category{
 	name: string;
 	id: number;
 }

@IonicPage()
@Component({
  selector: 'page-search-side-bar',
  templateUrl: 'search-side-bar.html',
})
export class SearchSideBarPage {

	@ViewChild('menubutton') nav: NavController   // sets up the navController, which allows to switch between SlideMenu and SearchPage
	categories: Category[];                       // array of all the categories
	active: Category = null;                      // saves the last chosen category to change the CSS
  // isInternet: boolean = true;
  navig: NavController;                         // NavController object from HomePage (passed to SearchPage)

  /* Constructor ->
     *downloads al categories and adds "All" category
     *subscribes for an event fired when SearchPage switches to Home Page (clears the CSS,
      because the navigation stack doesn't work properly here)
  */
  constructor(public navCtrl: NavController, public navParams: NavParams, public menuCtrl: MenuController,
              public dbProvider: DbProvider, public events: Events) {
  	this.navig = navParams.get('nav');

    dbProvider.getFromDb('category', 4000).then(data => {
  		this.categories = <Category[]>data;
      let cat = {name: 'All', id: -1};
      this.active = cat;
      this.categories.splice(0, 0, cat);
  	}).catch(err => this.dbProvider.getAlert().present() );


    this.events.subscribe('retry', () => {
      dbProvider.getFromDb('category', 4000).then(data => {
          this.categories = <Category[]>data;
          let cat = {name: 'All', id: -1};
          this.active = cat;
          this.categories.splice(0, 0, cat);
      }).catch(err => this.dbProvider.getAlert().present() );
    });
  }

  /* Saves chosen category, closes SlideMenu and fires an event with the id of the category as it's parameter */
  public addFilter(category:Category){
  	this.active = category;
  	this.menuCtrl.close();
  	this.events.publish('menu:closed', category.id);
  }

  /* Decides the CSS style for the categories */
  public checkActive(category:Category){
  	return category==this.active;
  }

  /* Moves to the SearchPage, passing the navController from HomePage */
   ngOnInit() {
      this.nav.push(SearchPage, {nav: this.navig});
   }

}
