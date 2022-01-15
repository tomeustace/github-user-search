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
      this.pages = this.pages.map((page) => page + 1);
      console.log("PaginatorComponent.ngAfterViewInit()", this.pages);
    }

    this.changeRef.detectChanges();
  }

  pageUsers(page: number) {
    this.activePage = page - 1;
    this.userSearchService.pageUsers(page - 1);
    this.changeRef.detectChanges();
  }
}
