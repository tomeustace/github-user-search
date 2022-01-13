import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserSearchService } from '../user-search/user-search.service';

@Component({
  selector: 'app-user-container',
  templateUrl: './user-container.component.html',
  styleUrls: ['./user-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserContainerComponent implements OnInit {

  numberOfPages!: number;

  constructor(private userSearchService: UserSearchService, private changeRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.userSearchService.search$.subscribe((numberOfPages: number) => {
      console.log("pages", numberOfPages);
      this.numberOfPages = numberOfPages;
      this.changeRef.detectChanges();
    });
  }

}
