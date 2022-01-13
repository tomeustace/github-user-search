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

    this.changeRef.detectChanges();
  }

  pageUsers(page: string) {
    this.userSearchService.pageUsers(page);
  }
}
