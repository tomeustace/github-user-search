import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../user-search/user';
import { UserSearchService } from '../user-search/user-search.service';

@Component({
  selector: 'app-user-container',
  templateUrl: './user-container.component.html',
  styleUrls: ['./user-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserContainerComponent implements OnInit {

  numberOfPages!: number;
  totalUserCount!: number;
  noUsersFound!: boolean;
  users!: User[];

  error$: Observable<string> = this.userSearchService.error$;
  loading$: Observable<boolean> = this.userSearchService.loading$;

  constructor(private userSearchService: UserSearchService, private changeRef: ChangeDetectorRef) { }

  ngOnInit(): void {

    this.userSearchService.users$.subscribe((users: any | null) => {
      if (users) {
        this.users = users;
        this.noUsersFound = false;
      } else {
        this.noUsersFound = true;
      }
      this.changeRef.detectChanges();
    });

    this.userSearchService.pages$.subscribe((numberOfPages: number) => {
      this.numberOfPages = numberOfPages;
      this.changeRef.detectChanges();
    });

    this.userSearchService.totalCount$.subscribe((totalUserCount: number) => {
      this.totalUserCount = totalUserCount;
      this.changeRef.detectChanges();
    });
  }

}
