import { CommonModule } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subject, takeUntil } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { CollectionId } from "@bitwarden/common/types/guid";
import { CollectionService } from "@bitwarden/common/vault/abstractions/collection.service";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import { CardView } from "@bitwarden/common/vault/models/view/card.view";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";
import { FolderView } from "@bitwarden/common/vault/models/view/folder.view";
import { SearchModule, CalloutModule } from "@bitwarden/components";

import { AdditionalOptionsComponent } from "./additional-options/additional-options.component";
import { AttachmentsV2ViewComponent } from "./attachments/attachments-v2-view.component";
import { AutofillOptionsViewComponent } from "./autofill-options/autofill-options-view.component";
import { CardDetailsComponent } from "./card-details/card-details-view.component";
import { CustomFieldV2Component } from "./custom-fields/custom-fields-v2.component";
import { ItemDetailsV2Component } from "./item-details/item-details-v2.component";
import { ItemHistoryV2Component } from "./item-history/item-history-v2.component";
import { LoginCredentialsViewComponent } from "./login-credentials/login-credentials-view.component";
import { ViewIdentitySectionsComponent } from "./view-identity-sections/view-identity-sections.component";

@Component({
  selector: "app-cipher-view",
  templateUrl: "cipher-view.component.html",
  standalone: true,
  imports: [
    CalloutModule,
    CommonModule,
    SearchModule,
    JslibModule,
    ItemDetailsV2Component,
    AdditionalOptionsComponent,
    AttachmentsV2ViewComponent,
    ItemHistoryV2Component,
    CustomFieldV2Component,
    CardDetailsComponent,
    ViewIdentitySectionsComponent,
    LoginCredentialsViewComponent,
    AutofillOptionsViewComponent,
  ],
})
export class CipherViewComponent implements OnInit, OnDestroy {
  @Input() cipher: CipherView;
  organization$: Observable<Organization>;
  folder$: Observable<FolderView>;
  collections$: Observable<CollectionView[]>;
  private destroyed$: Subject<void> = new Subject();
  cardIsExpired: boolean = false;

  constructor(
    private organizationService: OrganizationService,
    private collectionService: CollectionService,
    private folderService: FolderService,
  ) {}

  async ngOnInit() {
    await this.loadCipherData();

    this.cardIsExpired = this.isCardExpiryInThePast();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  get hasCard() {
    const { cardholderName, code, expMonth, expYear, brand, number } = this.cipher.card;
    return cardholderName || code || expMonth || expYear || brand || number;
  }

  get hasLogin() {
    const { username, password, totp } = this.cipher.login;
    return username || password || totp;
  }

  get hasAutofill() {
    return this.cipher.login?.uris.length > 0;
  }

  async loadCipherData() {
    if (this.cipher.collectionIds.length > 0) {
      this.collections$ = this.collectionService
        .decryptedCollectionViews$(this.cipher.collectionIds as CollectionId[])
        .pipe(takeUntil(this.destroyed$));
    }

    if (this.cipher.organizationId) {
      this.organization$ = this.organizationService
        .get$(this.cipher.organizationId)
        .pipe(takeUntil(this.destroyed$));
    }

    if (this.cipher.folderId) {
      this.folder$ = this.folderService
        .getDecrypted$(this.cipher.folderId)
        .pipe(takeUntil(this.destroyed$));
    }
  }

  isCardExpiryInThePast() {
    if (this.cipher.card) {
      const { expMonth, expYear }: CardView = this.cipher.card;

      if (expYear && expMonth) {
        // `Date` months are zero-indexed
        const parsedMonth = parseInt(expMonth) - 1;
        const parsedYear = parseInt(expYear);

        // First day of the next month minus one, to get last day of the card month
        const cardExpiry = new Date(parsedYear, parsedMonth + 1, 0);
        const now = new Date();

        return cardExpiry < now;
      }
    }

    return false;
  }
}
