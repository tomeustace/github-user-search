import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { User } from './user';
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserSearchService {

  private readonly url = 'https://api.github.com/search/users?';

  private pagesSubject = new Subject<number>();
  private searchValue!: string;

  search$ = this.pagesSubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  searchUsers(searchValue: string) {
    this.searchValue = searchValue;

    const queryUrl = `${this.url}q=${searchValue}`;
    this.httpClient
      .get<User[]>(queryUrl, { observe: 'response' })
      .pipe(
        tap((response: HttpResponse<User[]>) => {
          this.extractLinks(response);
        })
      )
      .subscribe((response: HttpResponse<User[]>) => {
        if (response) {
          console.log(response.body);
        }
      });
  }

  pageUsers(page: string) {
    const url = this.url + 'q=' + this.searchValue + '&page=' + (page + 1);
    this.httpClient
      .get<User[]>(url, { observe: 'response' })
      .pipe(
        tap((response: HttpResponse<User[]>) => {
          // this.extractLinks(response);
        })
      )
      .subscribe((response: HttpResponse<User[]>) => {
        if (response) {
          console.log(response.body);
        }
      });
    }

  private extractLinks(response: HttpResponse<User[]>) {
    let link = response.headers.get('Link');
    // Split parts by comma
    var parts = link?.split(',');
    var links: any = {};
    // Parse each part into a named link
    if (parts) {
      for (var i = 0; i < parts?.length; i++) {
        var section = parts[i].split(';');
        if (section.length !== 2) {
          throw new Error("section could not be split on ';'");
        }
        var url = section[0].replace(/<(.*)>/, '$1').trim();
        var name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = url;
      }
    }
    const pageTokens = links.last.split('&');
    const numberOfPages =
      pageTokens[pageTokens.length - 1].match(/page=(\d+).*$/)[1];

    this.pagesSubject.next(+numberOfPages);
    console.log("numberOfPages", numberOfPages);
  }
}
