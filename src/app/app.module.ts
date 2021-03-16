import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {MetadataService} from './metadata.service';
import {ImageService} from './image.service';
import {MatTabsModule} from '@angular/material/tabs';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import { SideNavComponent } from './side-nav/side-nav.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {AppRoutingModule} from './app-routing.module';
import { ExploreComponent } from './explore/explore.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCardModule} from '@angular/material/card';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatDialogModule} from '@angular/material/dialog';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  declarations: [
    AppComponent,
    SideNavComponent,
    ExploreComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    MatTabsModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatSliderModule,
    FontAwesomeModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule,
    MatCheckboxModule,
    FormsModule,
    MatSlideToggleModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatPaginatorModule,
    MatGridListModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatToolbarModule,
    MatIconModule
  ],
  providers: [
    MetadataService,
    ImageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
