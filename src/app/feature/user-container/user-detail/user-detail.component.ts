import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core';
import { User } from '../../user-search/user';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent implements OnInit {

  @Input() user!: User;

  constructor(@Inject(DOCUMENT) private document: Document) { }

  ngOnInit(): void { }

  /**
   * Open the user's github profile in a new tab
   * Create dynamic link to avoid issues with popup blockers
   * @param user
   * https://stackoverflow.com/questions/52240123/how-to-open-a-link-in-new-tab-using-angular
   */
  navigateToUser(user: User) {
    const link = this.document.createElement('a');
    link.target = '_blank';
    link.href = user.html_url;
    link.click();
    link.remove();
  }

}
