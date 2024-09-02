import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom, map, Observable, switchMap } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AUTOFILL_ID, SHOW_AUTOFILL_BUTTON } from "@bitwarden/common/autofill/constants";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";
import { FolderView } from "@bitwarden/common/vault/models/view/folder.view";
import {
  AsyncActionsModule,
  SearchModule,
  ButtonModule,
  IconButtonModule,
  DialogService,
  ToastService,
} from "@bitwarden/components";
import { TotpCaptureService } from "@bitwarden/vault";

import { CipherViewComponent } from "../../../../../../../../libs/vault/src/cipher-view";
import { PopOutComponent } from "../../../../../platform/popup/components/pop-out.component";
import { BrowserTotpCaptureService } from "../../../services/browser-totp-capture.service";

import { PopupFooterComponent } from "./../../../../../platform/popup/layout/popup-footer.component";
import { PopupHeaderComponent } from "./../../../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "./../../../../../platform/popup/layout/popup-page.component";
import { VaultPopupAutofillService } from "./../../../services/vault-popup-autofill.service";

@Component({
  selector: "app-view-v2",
  templateUrl: "view-v2.component.html",
  standalone: true,
  providers: [{ provide: TotpCaptureService, useClass: BrowserTotpCaptureService }],
  imports: [
    CommonModule,
    SearchModule,
    JslibModule,
    FormsModule,
    ButtonModule,
    PopupPageComponent,
    PopupHeaderComponent,
    PopupFooterComponent,
    IconButtonModule,
    CipherViewComponent,
    AsyncActionsModule,
    PopOutComponent,
  ],
})
export class ViewV2Component {
  headerText: string;
  cipher: CipherView;
  organization$: Observable<Organization>;
  folder$: Observable<FolderView>;
  collections$: Observable<CollectionView[]>;
  loadAction: typeof AUTOFILL_ID | typeof SHOW_AUTOFILL_BUTTON;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private i18nService: I18nService,
    private cipherService: CipherService,
    private dialogService: DialogService,
    private logService: LogService,
    private toastService: ToastService,
    private vaultPopupAutofillService: VaultPopupAutofillService,
    private accountService: AccountService,
  ) {
    this.subscribeToParams();
  }

  subscribeToParams(): void {
    this.route.queryParams
      .pipe(
        switchMap(async (params): Promise<CipherView> => {
          this.loadAction = params.action;
          return await this.getCipherData(params.cipherId);
        }),
        switchMap(async (cipher) => {
          this.cipher = cipher;
          this.headerText = this.setHeader(cipher.type);
          if (this.loadAction === AUTOFILL_ID || this.loadAction === SHOW_AUTOFILL_BUTTON) {
            await this.vaultPopupAutofillService.doAutofill(this.cipher);
          }
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  setHeader(type: CipherType) {
    switch (type) {
      case CipherType.Login:
        return this.i18nService.t("viewItemHeader", this.i18nService.t("typeLogin").toLowerCase());
      case CipherType.Card:
        return this.i18nService.t("viewItemHeader", this.i18nService.t("typeCard").toLowerCase());
      case CipherType.Identity:
        return this.i18nService.t(
          "viewItemHeader",
          this.i18nService.t("typeIdentity").toLowerCase(),
        );
      case CipherType.SecureNote:
        return this.i18nService.t("viewItemHeader", this.i18nService.t("note").toLowerCase());
    }
  }

  async getCipherData(id: string) {
    const cipher = await this.cipherService.get(id);
    const activeUserId = await firstValueFrom(
      this.accountService.activeAccount$.pipe(map((a) => a?.id)),
    );
    return await cipher.decrypt(
      await this.cipherService.getKeyForCipherKeyDecryption(cipher, activeUserId),
    );
  }

  async editCipher() {
    if (this.cipher.isDeleted) {
      return false;
    }
    void this.router.navigate(["/edit-cipher"], {
      queryParams: { cipherId: this.cipher.id, type: this.cipher.type, isNew: false },
    });
    return true;
  }

  delete = async (): Promise<boolean> => {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "deleteItem" },
      content: {
        key: this.cipher.isDeleted ? "permanentlyDeleteItemConfirmation" : "deleteItemConfirmation",
      },
      type: "warning",
    });

    if (!confirmed) {
      return false;
    }

    try {
      await this.deleteCipher();
    } catch (e) {
      this.logService.error(e);
      return false;
    }

    await this.router.navigate(["/vault"]);
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t(this.cipher.isDeleted ? "permanentlyDeletedItem" : "deletedItem"),
    });

    return true;
  };

  restore = async (): Promise<void> => {
    try {
      await this.cipherService.restoreWithServer(this.cipher.id);
    } catch (e) {
      this.logService.error(e);
    }

    await this.router.navigate(["/vault"]);
    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("restoredItem"),
    });
  };

  protected deleteCipher() {
    return this.cipher.isDeleted
      ? this.cipherService.deleteWithServer(this.cipher.id)
      : this.cipherService.softDeleteWithServer(this.cipher.id);
  }

  protected showFooter(): boolean {
    return this.cipher && (!this.cipher.isDeleted || (this.cipher.isDeleted && this.cipher.edit));
  }
}
