import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchSideBarPage } from './search-side-bar';

@NgModule({
  declarations: [
    SearchSideBarPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchSideBarPage),
  ],
})
export class SearchSideBarPageModule {}
