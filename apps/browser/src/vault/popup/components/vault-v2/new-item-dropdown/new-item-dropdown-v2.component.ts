import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Router, RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CollectionId, OrganizationId } from "@bitwarden/common/types/guid";
import { CipherType } from "@bitwarden/common/vault/enums";
import { ButtonModule, DialogService, MenuModule, NoItemsModule } from "@bitwarden/components";

import { AddEditQueryParams } from "../add-edit/add-edit-v2.component";
import { AddEditFolderDialogComponent } from "../add-edit-folder-dialog/add-edit-folder-dialog.component";

export interface NewItemInitialValues {
  folderId?: string;
  organizationId?: OrganizationId;
  collectionId?: CollectionId;
  uri?: string;
}

@Component({
  selector: "app-new-item-dropdown",
  templateUrl: "new-item-dropdown-v2.component.html",
  standalone: true,
  imports: [NoItemsModule, JslibModule, CommonModule, ButtonModule, RouterLink, MenuModule],
})
export class NewItemDropdownV2Component {
  cipherType = CipherType;

  /**
   * Optional initial values to pass to the add cipher form
   */
  @Input()
  initialValues: NewItemInitialValues;

  constructor(
    private router: Router,
    private dialogService: DialogService,
  ) {}

  private buildQueryParams(type: CipherType): AddEditQueryParams {
    return {
      type: type.toString(),
      collectionId: this.initialValues?.collectionId,
      organizationId: this.initialValues?.organizationId,
      folderId: this.initialValues?.folderId,
      uri: this.initialValues?.uri,
    };
  }

  newItemNavigate(type: CipherType) {
    void this.router.navigate(["/add-cipher"], { queryParams: this.buildQueryParams(type) });
  }

  openFolderDialog() {
    this.dialogService.open(AddEditFolderDialogComponent);
  }
}
