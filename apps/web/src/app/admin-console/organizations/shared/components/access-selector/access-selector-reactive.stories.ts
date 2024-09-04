import { importProvidersFrom } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
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

export default {
  title: "Web/Organizations/Access Selector/Reactive form",
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

// TODO: This is a workaround since this story does weird things.
type Story = StoryObj<any>;
const fb = new FormBuilder();

const ReactiveFormAccessSelectorRender = (args: any) => ({
  props: {
    items: [],
    onSubmit: actionsData.onSubmit,
    ...args,
  },
  template: `
    <form [formGroup]="formObj" (ngSubmit)="onSubmit(formObj.controls.formItems.value)">
      <bit-access-selector
        formControlName="formItems"
        [items]="items"
        [columnHeader]="columnHeader"
        [selectorLabelText]="selectorLabelText"
        [selectorHelpText]="selectorHelpText"
        [emptySelectionText]="emptySelectionText"
        [permissionMode]="permissionMode"
        [showMemberRoles]="showMemberRoles"
      ></bit-access-selector>
      <button type="submit" bitButton buttonType="primary" class="tw-mt-5">Submit</button>
    </form>
`,
});

const sampleMembers = itemsFactory(10, AccessItemType.Member);
const sampleGroups = itemsFactory(6, AccessItemType.Group);

export const ReactiveForm: Story = {
  args: {
    formObj: fb.group({ formItems: [[{ id: "1g" }]] }),
    permissionMode: "edit",
    showMemberRoles: false,
    columnHeader: "Groups/Members",
    selectorLabelText: "Select groups and members",
    selectorHelpText:
      "Permissions set for a member will replace permissions set by that member's group",
    emptySelectionText: "No members or groups added",
    items: sampleGroups.concat(sampleMembers),
  },
  render: ReactiveFormAccessSelectorRender,
};
