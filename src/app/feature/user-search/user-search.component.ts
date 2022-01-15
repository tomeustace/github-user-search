import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UserSearchService } from './user-search.service';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSearchComponent implements OnInit {

  constructor(private userSearchService: UserSearchService) { }

  ngOnInit(): void { }

  searchUsers(searchValue: string) {
    if (searchValue.trim()) {
      this.userSearchService.searchUsers(searchValue);
    }
  }

}
