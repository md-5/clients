import { importProvidersFrom } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { applicationConfig, Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  AvatarModule,
  BadgeModule,
  ButtonModule,
  DialogModule,
  FormFieldModule,
  IconButtonModule,
  TableModule,
  TabsModule,
} from "@bitwarden/components";

import { PreloadedEnglishI18nModule } from "../../../../../core/tests";

import { AccessSelectorComponent } from "./access-selector.component";
import { AccessItemType } from "./access-selector.models";
import { actionsData, itemsFactory } from "./storybook-utils";
import { UserTypePipe } from "./user-type.pipe";

// TODO: This is a workaround since this story does weird things.
type Story = StoryObj<any>;

export default {
  title: "Web/Organizations/Access Selector",
  decorators: [
    moduleMetadata({
      declarations: [AccessSelectorComponent, UserTypePipe],
      imports: [
        DialogModule,
        ButtonModule,
        FormFieldModule,
        AvatarModule,
        BadgeModule,
        ReactiveFormsModule,
        FormsModule,
        TabsModule,
        TableModule,
        JslibModule,
        IconButtonModule,
      ],
      providers: [],
    }),
    applicationConfig({
      providers: [importProvidersFrom(PreloadedEnglishI18nModule)],
    }),
  ],
  parameters: {},
  argTypes: {
    formObj: { table: { disable: true } },
  },
} as Meta;

const DialogAccessSelectorRender = (args: any) => ({
  props: {
    items: [],
    valueChanged: actionsData.onValueChanged,
    initialValue: [],
    ...args,
  },
  template: `
    <bit-dialog [dialogSize]="dialogSize" [disablePadding]="disablePadding">
      <span bitDialogTitle>Access selector</span>
      <span bitDialogContent>
        <bit-access-selector
          (ngModelChange)="valueChanged($event)"
          [ngModel]="initialValue"
          [items]="items"
          [disabled]="disabled"
          [columnHeader]="columnHeader"
          [showGroupColumn]="showGroupColumn"
          [selectorLabelText]="selectorLabelText"
          [selectorHelpText]="selectorHelpText"
          [emptySelectionText]="emptySelectionText"
          [permissionMode]="permissionMode"
          [showMemberRoles]="showMemberRoles"
        ></bit-access-selector>
      </span>
      <ng-container bitDialogFooter>
        <button bitButton buttonType="primary">Save</button>
        <button bitButton buttonType="secondary">Cancel</button>
        <button
          class="tw-ml-auto"
          bitIconButton="bwi-trash"
          buttonType="danger"
          size="default"
          title="Delete"
          aria-label="Delete"></button>
      </ng-container>
    </bit-dialog>
  `,
});

const dialogAccessItems = itemsFactory(10, AccessItemType.Collection);

export const Dialog: Story = {
  args: {
    permissionMode: "edit",
    showMemberRoles: false,
    showGroupColumn: true,
    columnHeader: "Collection",
    selectorLabelText: "Select Collections",
    selectorHelpText: "Some helper text describing what this does",
    emptySelectionText: "No collections added",
    disabled: false,
    initialValue: [] as any[],
    items: dialogAccessItems,
  },
  render: DialogAccessSelectorRender,
};
