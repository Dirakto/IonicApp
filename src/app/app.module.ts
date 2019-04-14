import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';
import { SplashPage } from '../pages/splash/splash';
import { SettingsPage } from '../pages/settings/settings';
import { DisclaimerAboutPage } from '../pages/disclaimer-about/disclaimer-about';
import { LogingPage } from '../pages/loging/loging';
import { SearchPage } from '../pages/search/search';
import { SearchSideBarPage } from '../pages/search-side-bar/search-side-bar';
import { FavouritePage } from '../pages/favourite/favourite';
import { BookPage } from '../pages/book/book';

import { HttpModule } from '@angular/http';
import {HttpClientModule} from '@angular/common/http';

import { IonicStorageModule } from '@ionic/storage';
import { DbProvider } from '../providers/db/db';
import { FavouritesProvider } from '../providers/favourites/favourites';
import { DataHolderProvider } from '../providers/data-holder/data-holder';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SplashPage,
    SettingsPage,
    DisclaimerAboutPage,
    LogingPage,
    SearchPage,
    SearchSideBarPage,
    FavouritePage,
    BookPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    HttpClientModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SplashPage,
    SettingsPage,
    DisclaimerAboutPage,
    LogingPage,
    SearchPage,
    SearchSideBarPage,
    FavouritePage,
    BookPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DbProvider,
    FavouritesProvider,
    DataHolderProvider
  ]
})
export class AppModule {}