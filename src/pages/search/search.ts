import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DbProvider } from '../../providers/db/db';
import { BookPage } from '../book/book';
import { Events } from 'ionic-angular';
import { DataHolderProvider } from '../../providers/data-holder/data-holder';
import { Searchbar } from 'ionic-angular';
import { HomePage } from '../home/home';


// /* Creating a global interface representing books' covers */
// declare global{
//   interface Books{
//     id: number;
//     name:string;
//     cover:string;
//   }
// }

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  turnOffScroll = false;   // turn off infinite-scroll when we downloaded all available books

  chosenCategory = -1;     // currently chosen book category
  searchPhrase = '';       // currently typed phrase in searchbar
  @ViewChild('search') searchbar: Searchbar;  // object representing searchbar

  booksArray:Books[];      // array of downloaded books
  startIndex = 0;          // required to operate API - allows to download books in chunks
  loadNumber = 4;          // required to operate API - describes how many books to download in a chunk
  maxIndex: number = -1;   // from API - states how many books are available and is used to turn off infinite-scroll
  
  isReadyIndex: boolean = false;  // checks if maxIndex has been set (to wait with rendering of the view)
  isReadyBook: boolean = false;   // checks if booksArray has been set (to wait with rendering of the view)

  nav: NavController;             // NavController object passed from SearchSideBarPage (so that we can go back to HomePage)
  isSearching: boolean = false;

  /*  Constructor ->
      *saves the NavController passed from SearchSideBarPage
      *downloads the books and stores them in dataHolder (provider) (if an error occured, it clears dataHolder and shows an alert)
      *downloads the amount of books that are available and stores the value in dataHolder (provider)
      *if the dataHolder already has stored books then loads them from there and updates startIndex to allow future downloading
       of the remaining books
      *subscribes to an event responsible for reacting to a user selecting category from SideMenu and downloads new books and
       the their available amount. It also clears the phrase in searchbar. If the chosen category is 'All',
       it loads books from dataHolder. while loading it sets isReadyIndex and isReadyBook to false, and to true after download is complet.
  */
  constructor(public navCtrl: NavController, public navParams: NavParams, public dbProvider: DbProvider,
              public events: Events, public dhProvider: DataHolderProvider) {

    this.nav = navParams.get('nav');

    if(!dhProvider.hasData()){

      this.dbProvider.sendToDb('books', (this.startIndex+':'+this.loadNumber+':'+this.chosenCategory), 5000).then( data=>{
          this.booksArray = <Books[]>data;
          this.startIndex += this.loadNumber;
          this.isReadyBook = true;
          dhProvider.saveBooks(this.booksArray);
      }).catch(err => {
          dbProvider.getAlert().present();
          dhProvider.saveBooks(null);
          dhProvider.saveMaxIndex(-1);
      });

      this.dbProvider.getFromDb('books?max='+this.chosenCategory, 5000).then( data => {
          this.maxIndex = <number>data;
          this.isReadyIndex = true;
          dhProvider.saveMaxIndex(this.maxIndex);
      }).catch(err => this.dbProvider.getAlert().present() );

    }else{
      this.loadFromDh();
    }

    events.subscribe('menu:closed', (data) => {
        this.isReadyIndex = false;
        this.isReadyBook = false;
        this.searchbar.clearInput(null);
        this.searchPhrase = '';

        this.chosenCategory = data;
        this.startIndex = 0;

        if(data == -1 && this.dhProvider.hasData()){
          this.loadFromDh();
        }else{
          this.turnOffScroll = false;
          this.dbProvider.sendToDb('books', (this.startIndex+':'+this.loadNumber+':'+this.chosenCategory+':'+this.searchPhrase), 5000).then( data=>{
              this.booksArray = <Books[]>data;
              this.isReadyBook = true;
              this.startIndex += this.loadNumber;
              if(this.booksArray.length < 4)
                this.turnOffScroll = true;
          }).catch( err => this.dbProvider.getAlert().present() );
          
          this.dbProvider.getFromDb('books?max='+this.chosenCategory, 3000).then( data => {
              this.maxIndex = <number>data;
              this.isReadyIndex = true;
          }).catch(err => this.dbProvider.getAlert().present() );
        }
    });
  }


  /* Sets up the InfiniteScroll ->
     *downloads new books according to chosen category and phrase
     *if the category is -1 ("All") and there is no phrase in searchbar, stores the books in dataHolder (provider)
     *updates startIndex
     *decides if the InfiniteScroll should be turned off
     *in case of an error it displays en alert
  */
  public doInfinite(infiniteScroll){
      this.dbProvider.sendToDb('books', (this.startIndex+':'+this.loadNumber+':'+this.chosenCategory+':'+this.searchPhrase), 7000).then( data=>{
          this.booksArray = this.booksArray.concat(<Books[]>data);
          if(this.chosenCategory == -1 && this.searchPhrase == '')
            this.dhProvider.saveBooks(this.booksArray);
          this.startIndex += this.loadNumber;
          infiniteScroll.complete();
          if(this.startIndex >= this.maxIndex)
            this.turnOffScroll = true;
      }).catch( err => {
          this.dbProvider.getAlert().present();
          infiniteScroll.complete();
      });
  }

  /* Returns to Home Page using navController from HomePage */
  public goToRoot(){
    this.nav.popTo(HomePage, {animate:true, animation:'transition', duration:500, direction: 'forward'});
  }

  /* Changes the page to that of a chosen book */
  public goToBook(book){                   
    this.navCtrl.push(BookPage, {id: book});
  }

  /* Responsible for setting searchPhrase and saving books visible before typing in searchbar (previous 'session') in dataHolder.
     If events tagName is not 'INPUT' then function stops, as well as if isReadyIndex and isReadyBook are not true.
     If search is performed when all available books where downloaded (startIndex >= maxIndex), it performs search on
     previous 'session' cached data (for increased speed), otherwise it sends request to the server (to obtain books matching
     the phrase and category, as well as their available amount). Important note - previous 'session' is cached only once,
     if the searchbar's phrase wasn't completly cleared.
  */
  public onInput(e){
    if(!this.isReadyIndex || !this.isReadyBook)
      return;
    
    if(e.target.tagName.toUpperCase() != 'INPUT')
      return;

    let substring = e.target.value.toLowerCase();
    if(!substring){
      this.onClear(e);
      return;
    }

    if(this.startIndex >= this.maxIndex && this.maxIndex != 0 && !this.isSearching){
      if(this.dhProvider.getBooksBeforeSearching() == null)
        this.dhProvider.saveBooksBeforeSearching(this.booksArray);

      this.booksArray = this.dhProvider.getBooksBeforeSearching().filter(book => book.name.toLowerCase().includes(substring));
    }else{
      this.isReadyBook = false;
      this.isReadyIndex = false;
      this.isSearching = true;
      this.searchPhrase = substring;


      if(this.dhProvider.getBooksBeforeSearching() == null)
        this.dhProvider.saveBooksBeforeSearching(this.booksArray);
      if(this.dhProvider.getMaxIndexBeforeSearching() == -1)
        this.dhProvider.saveMaxIndexBeforeSearching(this.maxIndex);

      this.dbProvider.sendToDb('books', (0+':'+this.loadNumber+':'+this.chosenCategory+':'+this.searchPhrase), 7000).then( data=>{
          this.booksArray = <Array<Books>>data;
          this.isReadyBook = true;
          this.startIndex = 0 + this.loadNumber;
          this.turnOffScroll = false;
      }).catch(err => this.dbProvider.getAlert().present() );

      this.dbProvider.getFromDb('books?max='+this.chosenCategory+'&like='+this.searchPhrase, 3000).then( data => {
          this.maxIndex = <number>data;
          this.isReadyIndex = true;
      }).catch(err => this.dbProvider.getAlert().present() );
    }
  }

  /* Fired when searchbar is cleared (there is no phrase). Sets searchPhrase to '', restores books before searching
     occurred (previous 'session'). It clears the session data and decides whether to turn infinite-scroll on or off
  */
  public onClear(e){
    this.searchPhrase = '';
    this.isSearching = false;
    if(this.dhProvider.getBooksBeforeSearching())
      this.booksArray = this.dhProvider.getBooksBeforeSearching().slice();
    if(this.dhProvider.getMaxIndexBeforeSearching() != -1)
      this.maxIndex = this.dhProvider.getMaxIndexBeforeSearching();

    this.dhProvider.saveBooksBeforeSearching(null);
    this.dhProvider.saveMaxIndexBeforeSearching(-1);
    this.startIndex = this.booksArray.length;

    if(this.startIndex < this.maxIndex)
      this.turnOffScroll = false;
    else
      this.turnOffScroll = true;
  }

  /* Loads cached books from dataHolder, decides whether to turn infinite-scroll on or off, sets isReadyIndex
     and isReadyBook to true
  */
  public loadFromDh(){
      this.booksArray = this.dhProvider.getBooks();
      this.maxIndex = this.dhProvider.getMaxIndex();
      this.startIndex = this.booksArray.length;
      if(this.startIndex >= this.maxIndex)
        this.turnOffScroll = true;
      else
        this.turnOffScroll = false;

      this.isReadyIndex = true;
      this.isReadyBook = true;
  }

}
