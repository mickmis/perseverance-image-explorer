import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {MetadataService} from './metadata.service';
import {ImageService} from './image.service';
import { CameraComponent } from './camera/camera.component';
import {MatTabsModule} from '@angular/material/tabs';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import { SideNavComponent } from './side-nav/side-nav.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatExpansionModule} from '@angular/material/expansion';

@NgModule({
  declarations: [
    AppComponent,
    CameraComponent,
    SideNavComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MatTabsModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatSliderModule,
    FontAwesomeModule,
    MatExpansionModule
  ],
  providers: [
    MetadataService,
    ImageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
