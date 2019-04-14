import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DataHolderProvider {

  /* This provider is supplementary for SerchPage */

	private booksArray: Books[] = null;              // caches books from 'All' category
	private maxIndex: number = -1;                   // caches maximal available amount of books from 'All' category

  private saveBooksWhileSearching:Books[] = null;  // caches downloaded books displayed before typign a phrase in the searchbar
  private saveMaxIndexWhileSearching: number = -1; // caches current books' available amount (displayed before typign a phrase in the searchbar)

  constructor(public http: HttpClient) {}

  /* getters and setters */
  saveBooks(booksArray: Books[]){
  	this.booksArray = booksArray;
  }
  getBooks(): Books[]{
  	return this.booksArray;
  }

  saveMaxIndex(index: number){
  	this.maxIndex = index;
  }
  getMaxIndex(): number{
  	return this.maxIndex;
  }

  getBooksBeforeSearching(){
    return this.saveBooksWhileSearching;
  }
  saveBooksBeforeSearching(booksArray: Books[]){
    this.saveBooksWhileSearching = booksArray;
  }
  
  getMaxIndexBeforeSearching(){
    return this.saveMaxIndexWhileSearching;
  }
  saveMaxIndexBeforeSearching(index: number){
    this.saveMaxIndexWhileSearching = index;
  }

  /* Checks if there is data cached */
  hasData(): boolean{
    if(this.booksArray == null || this.maxIndex == -1)
      return false;
    return true;
  }
}
