import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DbProvider } from '../../providers/db/db';
import { FavouritesProvider } from '../../providers/favourites/favourites';
import { BookPage } from '../book/book';
import { Events } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-favourite',
  templateUrl: 'favourite.html',
})
export class FavouritePage {

	array: Array<number>;                    // holds the ids of all books in favourites (used to download additional books' information)
  booksArray: Array<Books> = new Array();  // hold the books objects of favourites books (it's different from Book interface in book.ts)
  lastPickedBook: Books;                   // saves the last picked book in order to either remove it from view (or re-add)
  lastPickedBookIndex: number;             // saves the last picked book's index in the booksArray 

  /*  Constructor ->
      *downloads favourite books' ids using FavouritesProvider
      *after the download it downloads proper books' info (creating Books from Books interface in search.ts)
      *subscribes to 'refresh' event published by BookPage (to delete the book from the view)
      *subscribes to 'return' event published by BookPage (to re-add the deleted book to the view)
  */
  constructor(public navCtrl: NavController, public navParams: NavParams, public dbProvider: DbProvider,
              public favProvider: FavouritesProvider, public events: Events) {

    favProvider.fetchFavourites().then(data => {
      this.array = <Array<number>>data;
    }).then( ()=> {
      if(this.array.length > 0)
      this.dbProvider.sendToDb('favourite', this.array.toString(), 5000).then(answer => {
        this.booksArray = <Array<Books>>answer;
      }).catch(err => this.dbProvider.getAlert().present() );
   });

    this.events.subscribe('refresh', (id) => {
      this.lastPickedBookIndex = this.booksArray.indexOf(this.lastPickedBook);
      this.booksArray.splice(this.lastPickedBookIndex, 1);
    });
    this.events.subscribe('return', () => {
      this.booksArray.splice(this.lastPickedBookIndex, 0, this.lastPickedBook);
    });
  }

  /* Changes the page to the chosen book's BookPage (and sets lastPickedBook) */
  goToBook(book: Books){
    this.lastPickedBook = book;
    this.navCtrl.push(BookPage, {id: book.id});
  }

}
