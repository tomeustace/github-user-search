import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { UserSearchService } from '../../user-search/user-search.service';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent implements OnInit {
  @Input() numberOfPages!: number;

  pages!: any[];
  activePage = 1;

  constructor(private changeRef: ChangeDetectorRef, private userSearchService: UserSearchService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.numberOfPages > 10) {
      this.pages = Array.from(Array(8).keys());
      this.pages = this.pages.concat([
        '...',
        this.numberOfPages - 1,
        this.numberOfPages,
      ]);
    } else {
      this.pages = Array.from(Array(this.numberOfPages).keys());
    }

    // shift index by 1 to start from 1 instead of 0
    this.pages = this.pages.map((page) => page !== '...' ? page + 1 : page);
    this.changeRef.detectChanges();
  }

  /**
   * Request next page from service
   * @param page
   */
  pageUsers(page: number) {
    this.activePage = page !== 1 ? page - 1 : page;
    this.userSearchService.pageUsers(page - 1);
    this.changeRef.detectChanges();
  }

  nextPage() {
    this.pageUsers(this.activePage + 1);
    this.activePage = this.activePage + 1;
    this.changeRef.detectChanges();
  }

  previousPage() {
    this.pageUsers(this.activePage - 1);
    this.activePage = this.activePage - 1;
    this.changeRef.detectChanges();
  }
}
