import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserSearchService } from './feature/user-search/user-search.service';
import { UserSearchComponent } from './feature/user-search/user-search.component';
import { UserContainerComponent } from './feature/user-container/user-container.component';
import { UserDetailComponent } from './feature/user-container/user-detail/user-detail.component';
import { PaginatorComponent } from './feature/user-container/paginator/paginator.component';
@NgModule({
  declarations: [
    AppComponent,
    UserSearchComponent,
    UserContainerComponent,
    UserDetailComponent,
    PaginatorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [UserSearchService],
  bootstrap: [AppComponent]
})
export class AppModule { }
