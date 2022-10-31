import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { firstValueFrom, Observable } from "rxjs";

import { CipherService } from "@bitwarden/common/abstractions/cipher.service";
import { FolderService } from "@bitwarden/common/abstractions/folder/folder.service.abstraction";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { FolderView } from "@bitwarden/common/models/view/folder.view";

export interface BulkMoveDialogParams {
  cipherIds?: string[];
}

export enum BulkMoveDialogResult {
  Moved = "moved",
  Canceled = "canceled",
}

@Component({
  selector: "app-vault-bulk-move",
  templateUrl: "bulk-move-dialog.component.html",
})
export class BulkMoveDialogComponent implements OnInit {
  cipherIds: string[] = [];

  formGroup = this.formBuilder.group({
    folderId: ["", [Validators.required]],
  });
  folders$: Observable<FolderView[]>;
  formPromise: Promise<any>;

  constructor(
    @Inject(DIALOG_DATA) params: BulkMoveDialogParams,
    private dialogRef: DialogRef<BulkMoveDialogResult>,
    private cipherService: CipherService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private folderService: FolderService,
    private formBuilder: FormBuilder
  ) {
    this.cipherIds = params.cipherIds ?? [];
  }

  async ngOnInit() {
    this.folders$ = this.folderService.folderViews$;
    this.formGroup.patchValue({
      folderId: (await firstValueFrom(this.folders$))[0].id,
    });
  }

  protected cancel() {
    this.close(BulkMoveDialogResult.Canceled);
  }

  protected submit = async () => {
    if (this.formGroup.invalid) {
      return;
    }

    this.formPromise = this.cipherService.moveManyWithServer(
      this.cipherIds,
      this.formGroup.value.folderId
    );
    await this.formPromise;
    this.platformUtilsService.showToast("success", null, this.i18nService.t("movedItems"));
    this.close(BulkMoveDialogResult.Moved);
  };

  private close(result: BulkMoveDialogResult) {
    this.dialogRef.close(result);
  }
}
