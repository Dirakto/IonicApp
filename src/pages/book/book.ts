import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DbProvider } from '../../providers/db/db';
import { FavouritesProvider } from '../../providers/favourites/favourites';
import { Events } from 'ionic-angular';

// /*  Special interface representing book's information
// */
//  interface Book{
//  	  id: number;
// 	  name: string;
// 	  author: string;
// 	  year: string;
// 	  description: string;
// 	  cover: string;
// 	  category: number;
//  }

@IonicPage()
@Component({
  selector: 'page-book',
  templateUrl: 'book.html',
})
export class BookPage {

  public heart = 'heart-outline';     // current heart icon (changes bases on clicking icon)
	public book: Book;                  // chosen book's object
	public isReady: boolean = false;    // checks if the page is ready to display it's content

  public isFavReady: boolean = false; // checks if data about book being favourite or not has been downloaded
  public isInFavourites: boolean;     // if the book is in favourites or not

  /*  Constructor ->
      *obtains the chosen book's id
      *downloads chosen book's information and sets fields
      *checks if the chosen book is in favourites or not
  */
  constructor(public navCtrl: NavController, public navParams: NavParams, public dbProvider: DbProvider,
              public favProvider: FavouritesProvider,  public events: Events) {
  	var id = navParams.get('id');
  	this.dbProvider.getFromDb('books?id='+id, 5000).then(data => {
    		this.book = <Book>data;
    		this.isReady = true;
  	}).catch(err => this.dbProvider.getAlert().present() );

    favProvider.fetchFavourites().then( data => {
        if((<Array<number>>data).indexOf(id) == -1){
          this.isInFavourites = false;
          this.heart = 'heart-outline';
        }else{
          this.isInFavourites = true;
          this.heart = 'heart';
        }
        this.isFavReady = true;
    }).catch(err => console.log(err));
  }

  /* Responsible for adding or removing book from favourites ->
     *uses the FavouritesProvider to perform the task.
     *changes heart icon based on the task (either adding or removing).
     *published 'refresh' event to update the FavouritePage (deletes book from view)
     *published 'return' event to update the FavouritePage (adds the book to the view)
  */
  public toggleFavourites(){
    if(this.isInFavourites){
      this.heart = 'heart-outline';
      this.isInFavourites = false;
      this.favProvider.deleteBookFromStorage(this.book.id);
      this.events.publish('refresh', this.book.id);
    }else{
      this.heart = 'heart';
      this.isInFavourites = true;
      this.favProvider.addBookToStorage(this.book.id);
      this.events.publish('return');
    }
  }

}
