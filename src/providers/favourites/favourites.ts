import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { DbProvider } from '../../providers/db/db';


declare global{
  /* Adds my own 'unique' function to Array<> class */
	interface Array<T>{
		unique(): Array<T>;
	}
}

@Injectable()
export class FavouritesProvider {

  /* This provider arranges easy interface for obtaining and handling user's favourite books (from inner storage and if logged
     then also from the database) 
  */

	private favourites: Array<number> = null;           // holds storageData and if user is logged adds favourite books  from database
  private storageData: Array<number> = null;          // books obtained from application's inner storage
	private userLogged: boolean = false;                // checks if user is logged
  private initiation: Promise<Array<number>> = null;  // promise initializing data

  /* Constructor ->
     *defines my own 'unique' function for Array<> class
  */
  constructor(public http: HttpClient, public dbProvider: DbProvider, public storage: Storage) {
  	Array.prototype.unique = function() {
  		var a = this.concat();
  		for(let i = 1; i<a.length; i++){
  			if(a[i]===a[i-1])
  				a.splice(i, 1);
  		}
  		return a;
  	};
  }

  /* Initializes fields:
     *if the user is not logged, only data from inner storage is loaded
     *if user is logged, it downloads books from both inner storage and the database and joins them together,
      deleting the duplicates.
     *returns itself as a Promise (explained in 'fetchFavourites')
  */
  initiateFavourites(){
    this.initiation = new Promise<Array<number>>( (resolve, reject) => {
  	  this.storage.get('username').then(username => {
	      if(username == null){
	      	this.userLogged = false;
	      	this.storage.get('favourites').then(data => {
	      		if(data == null){
	      			this.storage.set('favourites', []);
	      			this.favourites = [];
	      		}else
	      			this.favourites = <Array<number>>data;

              this.storageData = this.favourites.slice();
	      	});
	      }else{
	      	this.userLogged = true;
	        this.storage.get('password').then(password => {
	          this.dbProvider.getFromDb('favourite?u='+username+'&p='+password, 7000).then(fav => {

	          	this.storage.get('favourites').then(data => {
	      			if(data == null){
                let tmpArr = new Array();
	      				this.storage.set('favourites', tmpArr);
                this.favourites = tmpArr;
                resolve(this.favourites);
              }else
	      			  this.favourites = (<Array<number>>data);

               this.storageData = this.favourites.slice();

	      			if(fav != false)
	      				this.favourites = this.favourites.concat(<Array<number>>fav);
	      	
	      			this.favourites = this.favourites.sort().unique();
              resolve(this.favourites);
	      		});

	          }).catch(err => this.dbProvider.getAlert().present() );
	        });
	      }
	   });
    });
    return this.initiation;
  }

  /* Returns 'favourites' as a Promise. If the initializing Promise hasn't set all fields yet, it awaits for it's result, otherwise
     simply returns 'favourites'.
  */
  fetchFavourites(){
    return new Promise(async (resolve, reject) => {
      if(this.favourites == null){
        await this.initiation.then(data => {
          resolve(data);
        }).catch(err => console.log(err));
      }else
        resolve(this.favourites);
    });
  }

  /* When user logs in */
  addLoggedData(username, password){
  	this.userLogged = true;
  	this.dbProvider.getFromDb('favourite?u='+username+'&p='+password, 5000).then(fav => {
  			this.favourites = this.storageData.slice();
  	      if(fav != false)
  	      	this.favourites = this.favourites.concat(<Array<number>>fav);
  	    this.favourites = this.favourites.sort().unique();
  	});
  }

  deleteLoggedUserData(){
  	this.userLogged = false;
  	this.favourites = this.storageData.slice();
  }

  addBookToStorage(id){
  	if(this.userLogged){
  		this.storage.get('username').then(username => {
  			this.storage.get('password').then(password => {
  				this.dbProvider.sendToDb('modifyFavourite', ('ADD:'+username+':'+password+':'+id), 3000);
  			});
  		});
  	}else{
  		this.storageData.push(id);
  		this.storage.set('favourites', this.storageData);
  	}
  	this.favourites.push(id);
  }

  deleteBookFromStorage(id){
    if(this.userLogged){
      this.storage.get('username').then(username => {
        this.storage.get('password').then(password => {
          this.dbProvider.sendToDb('modifyFavourite', ('DELETE:'+username+':'+password+':'+id), 3000).catch(err => this.dbProvider.getAlert().present() );
        });
      });
    }
    let indexTmp = this.storageData.indexOf(id);
    if(indexTmp > -1){
      this.storageData.splice(indexTmp, 1);
      this.storage.set('favourites', this.storageData);
    }
   
   let index = this.favourites.indexOf(id);
   this.favourites.splice(index, 1);
 }
}
