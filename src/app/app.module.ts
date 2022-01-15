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
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
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
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [UserSearchService],
  bootstrap: [AppComponent]
})
export class AppModule { }
