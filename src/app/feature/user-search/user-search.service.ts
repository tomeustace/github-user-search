import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { User } from './user';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of, Subject, throwError } from 'rxjs';
import { SearchResult } from './search';

@Injectable({
  providedIn: 'root',
})
export class UserSearchService {

  private readonly url = 'https://api.github.com/search/users?';
  private readonly userUrl = 'https://api.github.com/users/';

  private searchValue!: string;
  private pagesSubject = new Subject<number>();
  private usersSubject = new BehaviorSubject<User[] | null>(null);

  search$ = this.pagesSubject.asObservable();
  users$ = this.usersSubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  searchUsers(searchValue: string) {
    this.searchValue = searchValue;

    const queryUrl = `${this.url}q=${searchValue}&per_page=1`;

    this.httpClient
      .get<SearchResult>(queryUrl, { observe: 'response' })
      .pipe(
        catchError((error: any) => throwError(() => {
          throw new Error(error);
        })),
        tap((response: HttpResponse<SearchResult>) => {
          this.extractLinks(response);
        }),
        switchMap(response => {
          if (response) {
            const loginIds = response?.body?.items?.map(user => {
              return this.httpClient.get(`${this.userUrl}${user.login}`) as Observable<any>;
            });
            if (loginIds) {
              // need to get description / bio from users and add to user data
              return forkJoin(loginIds);
            }
          }
          return of(null);
        })
      )
      .subscribe(response  => {
        if (response) {
          this.usersSubject.next(response);
        }
      });
  }

  pageUsers(page: string) {
    const url = this.url + 'q=' + this.searchValue + '&page=' + (page + 1);
    this.httpClient
      .get<SearchResult>(url, { observe: 'response' })
      .pipe(
        tap((response: HttpResponse<SearchResult>) => {
          this.extractLinks(response);
        })
      )
      .subscribe((response: HttpResponse<SearchResult>) => {
        if (response) {
          console.log(response.body);
        }
      });
    }

  private extractLinks(response: HttpResponse<SearchResult>) {
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
  }
}
