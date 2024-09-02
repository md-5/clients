import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit, EventEmitter, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import {
  AsyncActionsModule,
  DialogModule,
  DialogService,
  ToastService,
} from "@bitwarden/components";

import { CipherViewComponent } from "../../../../../../libs/vault/src/cipher-view/cipher-view.component";
import { SharedModule } from "../../shared/shared.module";

export interface ViewCipherDialogParams {
  cipher: CipherView;
}

export enum ViewCipherDialogResult {
  edited = "edited",
  deleted = "deleted",
}

export interface ViewCipherDialogCloseResult {
  action: ViewCipherDialogResult;
}

/**
 * Component for viewing a cipher, presented in a dialog.
 */
@Component({
  selector: "app-vault-view",
  templateUrl: "view.component.html",
  standalone: true,
  imports: [CipherViewComponent, CommonModule, AsyncActionsModule, DialogModule, SharedModule],
})
export class ViewComponent implements OnInit, OnDestroy {
  cipher: CipherView;
  onDeletedCipher = new EventEmitter<CipherView>();
  cipherTypeString: string;
  cipherEditUrl: string;
  organization: Organization;
  restrictProviderAccess = false;

  protected destroy$ = new Subject<void>();

  constructor(
    @Inject(DIALOG_DATA) public params: ViewCipherDialogParams,
    private dialogRef: DialogRef<ViewCipherDialogCloseResult>,
    private i18nService: I18nService,
    private dialogService: DialogService,
    private messagingService: MessagingService,
    private logService: LogService,
    private cipherService: CipherService,
    private toastService: ToastService,
    private organizationService: OrganizationService,
    private router: Router,
    private configService: ConfigService,
  ) {}

  /**
   * Lifecycle hook for component initialization.
   */
  async ngOnInit() {
    this.cipher = this.params.cipher;
    this.cipherTypeString = this.getCipherViewTypeString();
    if (this.cipher.organizationId) {
      this.organization = await this.organizationService.get(this.cipher.organizationId);
    }
    this.restrictProviderAccess = await this.configService.getFeatureFlag(
      FeatureFlag.RestrictProviderAccess,
    );
  }

  /**
   * Lifecycle hook for component destruction.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Method to handle cipher deletion. Called when a user clicks the delete button.
   */
  delete = async () => {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "deleteItem" },
      content: {
        key: this.cipher.isDeleted ? "permanentlyDeleteItemConfirmation" : "deleteItemConfirmation",
      },
      type: "warning",
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.deleteCipher();
      this.toastService.showToast({
        variant: "success",
        title: this.i18nService.t("success"),
        message: this.i18nService.t(
          this.cipher.isDeleted ? "permanentlyDeletedItem" : "deletedItem",
        ),
      });
      this.onDeletedCipher.emit(this.cipher);
      this.messagingService.send(
        this.cipher.isDeleted ? "permanentlyDeletedCipher" : "deletedCipher",
      );
    } catch (e) {
      this.logService.error(e);
    }

    this.dialogRef.close({ action: ViewCipherDialogResult.deleted });
  };

  /**
   * Helper method to delete cipher.
   */
  protected async deleteCipher(): Promise<void> {
    const asAdmin = this.organization?.canEditAllCiphers(this.restrictProviderAccess);
    if (this.cipher.isDeleted) {
      await this.cipherService.deleteWithServer(this.cipher.id, asAdmin);
    } else {
      await this.cipherService.softDeleteWithServer(this.cipher.id, asAdmin);
    }
  }

  /**
   * Method to handle cipher editing. Called when a user clicks the edit button.
   */
  async edit(): Promise<void> {
    this.dialogRef.close({ action: ViewCipherDialogResult.edited });
    await this.router.navigate([], {
      queryParams: {
        itemId: this.cipher.id,
        action: "edit",
        organizationId: this.cipher.organizationId,
      },
    });
  }

  /**
   * Method to get cipher view type string, used for the dialog title.
   * E.g. "View login" or "View note".
   * @returns The localized string for the cipher type
   */
  getCipherViewTypeString(): string {
    if (!this.cipher) {
      return null;
    }

    switch (this.cipher.type) {
      case CipherType.Login:
        return this.i18nService.t("viewItemType", this.i18nService.t("typeLogin").toLowerCase());
      case CipherType.SecureNote:
        return this.i18nService.t("viewItemType", this.i18nService.t("note").toLowerCase());
      case CipherType.Card:
        return this.i18nService.t("viewItemType", this.i18nService.t("typeCard").toLowerCase());
      case CipherType.Identity:
        return this.i18nService.t("viewItemType", this.i18nService.t("typeIdentity").toLowerCase());
      default:
        return null;
    }
  }
}

/**
 * Strongly typed helper to open a cipher view dialog
 * @param dialogService Instance of the dialog service that will be used to open the dialog
 * @param config Configuration for the dialog
 * @returns A reference to the opened dialog
 */
export function openViewCipherDialog(
  dialogService: DialogService,
  config: DialogConfig<ViewCipherDialogParams>,
): DialogRef<ViewCipherDialogCloseResult> {
  return dialogService.open(ViewComponent, config);
}
