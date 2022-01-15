import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { User } from './user';
import { catchError, delay, switchMap, tap } from 'rxjs/operators';
import {
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
  private readonly PER_PAGE = 4;

  private searchValue!: string;

  private pagesSubject = new Subject<number>();
  public search$ = this.pagesSubject.asObservable();

  private usersSubject = new Subject<User[] | null>();
  public users$ = this.usersSubject.asObservable();

  private errorSubject = new Subject<string>();
  public error$ = this.errorSubject.asObservable();

  private loadingSubject = new Subject<boolean>();
  public loading$ = this.loadingSubject.asObservable();

  private totalCountSubject = new Subject<number>();
  public totalCount$ = this.totalCountSubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  searchUsers(searchValue: string | null, page?: number) {
    if (searchValue) {
      this.searchValue = searchValue;
    }

    this.loadingSubject.next(true);
    let queryUrl;

    if (page) {
      queryUrl = `${this.url}q=${this.searchValue}&per_page=${this.PER_PAGE}&page=${page}`;
    } else {
      queryUrl = `${this.url}q=${this.searchValue}&per_page=${this.PER_PAGE}`;
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
        delay(250),
        tap((response: HttpResponse<SearchResult>) => {
          this.extractLinks(response);
        }),
        tap((response: HttpResponse<SearchResult>) => {
          // emit total number of users found
          this.totalCountSubject.next(response.body?.total_count as number);
        }),
        switchMap((response: HttpResponse<SearchResult>) => {
          if (response) {
            if (response.body?.items.length === 0) {
              return of(null);
            }

            // Create an Observable for each user profile request
            const loginIds = response.body?.items.map((user) => {
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
                    console.error(error.message);
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
        this.loadingSubject.next(false);
        if (response) {
          this.usersSubject.next(response);
        } else {
          this.usersSubject.next(null);
        }
      }),
      (error: any) => {
        console.log('No users found', error);
      };
  }

  pageUsers(page: number) {
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

    if (links.last) {
      const pageTokens = links.last.split('&');
      const numberOfPages =
        pageTokens[pageTokens.length - 1].match(/page=(\d+).*$/)[1];
      this.pagesSubject.next(+numberOfPages);
    }
  }

}
