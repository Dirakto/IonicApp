import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DisclaimerAboutPage } from './disclaimer-about';

@NgModule({
  declarations: [
    DisclaimerAboutPage,
  ],
  imports: [
    IonicPageModule.forChild(DisclaimerAboutPage),
  ],
})
export class DisclaimerAboutPageModule {}
