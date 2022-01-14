import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { User } from './user';
import { catchError, delay, map, switchMap, tap } from 'rxjs/operators';
import {
  BehaviorSubject,
  combineLatest,
  forkJoin,
  Observable,
  of,
  Subject,
  throwError,
} from 'rxjs';
import { SearchResult } from './search';

@Injectable({
  providedIn: 'root',
})
export class UserSearchService {
  private readonly url = 'https://api.github.com/search/users?';
  private readonly userUrl = 'https://api.github.com/users/';

  private searchValue!: string;

  private pagesSubject = new Subject<number>();
  search$ = this.pagesSubject.asObservable();

  private usersSubject = new BehaviorSubject<User[] | null>(null);
  users$ = this.usersSubject.asObservable();

  private errorSubject = new Subject<string>();
  error$ = this.errorSubject.asObservable();

  private loadingSubject = new Subject<boolean>();
  loading$ = this.loadingSubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  searchUsers(searchValue: string | null, page?: string) {
    if (searchValue) {
      this.searchValue = searchValue;
    }

    this.loadingSubject.next(true);
    let queryUrl;

    if (page) {
      queryUrl = `${this.url}q=${searchValue}&per_page=2&${page}`;
    } else {
      queryUrl = `${this.url}q=${searchValue}&per_page=2`;
    }

    this.httpClient
      .get<SearchResult>(queryUrl, { observe: 'response' })
      .pipe(
        catchError((error: any) =>
          throwError(() => {
            this.loadingSubject.next(false);
            this.errorSubject.next('Unable to get users from GitHub');
            throw new Error(error);
          })
        ),
        delay(1000),
        tap((response: HttpResponse<SearchResult>) => {
          this.extractLinks(response);
        }),
        switchMap((response: HttpResponse<SearchResult>) => {
          if (response) {
            const loginIds = response?.body?.items?.map((user) => {
              return this.httpClient.get(`${this.userUrl}${user.login}`).pipe(
                catchError((error: any) =>
                  throwError(() => {
                    this.loadingSubject.next(false);
                    const retryTimestamp =
                      response.headers.get('x-ratelimit-reset');
                    if (retryTimestamp) {
                      try {
                        const retryTime = new Date(
                          parseInt(retryTimestamp, 10) * 1000
                        );
                        this.errorSubject.next(
                          `Rate limit exceeded. Retry at ${retryTime}`
                        );
                      } catch (error) {
                        this.errorSubject.next(
                          'Error retrieving users from GitHub'
                        );
                      }
                      console.log(
                        'No users found ',
                        new Date(parseInt(retryTimestamp, 10) * 1000),
                        error
                      );
                    }
                    throw new Error(error);
                  })
                )
              ) as Observable<any>;
            });
            if (loginIds) {
              // need to get description / bio from users and add to user data
              return forkJoin(loginIds) as Observable<User[]>;
            }
          }
          return of(null);
        })
      )
      .subscribe((response: User[] | null) => {
        if (response) {
          this.loadingSubject.next(false);
          this.usersSubject.next(response);
        } else {
          console.log('No users found');
        }
      }),
      (error: any) => {
        console.log('No users found', error);
      };
  }

  pageUsers(page: string) {
    this.searchUsers(null, page);
  }

  private extractLinks(response: HttpResponse<SearchResult>) {
    let link = response.headers.get('Link');
    if (!link) {
      this.pagesSubject.next(1);
      return;
    }

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
