import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';

import { AlertController, Alert } from 'ionic-angular';


@Injectable()
export class DbProvider {

  /* This is a core provider, allowing communication with the API (is injected in most pages) */

	public url = 'http://localhost:8080/BooksAppAPI/';    // represents the API url

  constructor(public http: HttpClient, private alertCtrl: AlertController) {}

  /* Creates and returns an alert object */
  getAlert(): Alert{
  	let alert = this.alertCtrl.create({
      title: 'Connection problem',
      subTitle: 'Cannot connect to the internet or server unresponsive',
      buttons: ['Ok']
    });
  	return alert;
  }

  /* General method for sending requests to server via POST */
  sendToDb(path, msg, timeout){
  	return new Promise( (resolve, reject) => {
  		this.http.post(this.url+path, msg, {}).timeout(timeout).subscribe( data => {
  			resolve(data) }, err => reject(err) );
  		});
  	} 

  /* General method for obtaining data from server via GET */
  getFromDb(path, timeout){
  	return new Promise( (resolve, reject) => {
  		this.http.get(this.url+path, {}).timeout(timeout).subscribe( data => {
  			resolve(data) }, err => reject(err) );
  		});
  	} 
}


