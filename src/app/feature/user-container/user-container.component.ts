import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  users: User[] = [];

  constructor(private userSearchService: UserSearchService, private changeRef: ChangeDetectorRef) { }

  ngOnInit(): void {

    this.userSearchService.users$.subscribe((users: any | null) => {
      this.users = users;
      this.changeRef.detectChanges();
    });

    this.userSearchService.search$.subscribe((numberOfPages: number) => {
      this.numberOfPages = numberOfPages;
      this.changeRef.detectChanges();
    });
  }

}
