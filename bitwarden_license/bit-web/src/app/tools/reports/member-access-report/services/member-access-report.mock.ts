import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";

import { MemberAccessResponse } from "../response/member-access-report.response";

export const memberAccessReportsMock: MemberAccessResponse[] = [
  {
    userName: "Sarah Johnson",
    email: "sjohnson@email.com",
    twoFactorEnabled: true,
    accountRecoveryEnabled: true,
    groupsCount: 2,
    collectionsCount: 4,
    totalItemCount: 20,
    accessDetails: [
      {
        groupId: "",
        collectionId: "c1",
        collectionName: new EncString(
          "2.UiXa3L3Ol1G4QnfFfBjMQw==|sbVTj0EiEkhIrDiropn2Cg==|82P78YgmapW4TdN9jQJgMWKv2gGyK1AnGkr+W9/sq+A=",
        ),
        groupName: "",
        itemCount: 10,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
      {
        groupId: "",
        collectionId: "c2",
        collectionName: new EncString("Collection 2"),
        groupName: "",
        itemCount: 20,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
      {
        groupId: "",
        collectionId: "c3",
        collectionName: new EncString("Collection 3"),
        groupName: "",
        itemCount: 30,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
      {
        groupId: "g1",
        collectionId: "c1",
        collectionName: new EncString(
          "2.UiXa3L3Ol1G4QnfFfBjMQw==|sbVTj0EiEkhIrDiropn2Cg==|82P78YgmapW4TdN9jQJgMWKv2gGyK1AnGkr+W9/sq+A=",
        ),
        groupName: "Group 1",
        itemCount: 30,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
      {
        groupId: "g1",
        collectionId: "c2",
        collectionName: new EncString("Collection 2"),
        groupName: "Group 1",
        itemCount: 20,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
    ],
  },
  {
    userName: "James Lull",
    email: "jlull@email.com",
    twoFactorEnabled: false,
    accountRecoveryEnabled: false,
    groupsCount: 2,
    collectionsCount: 4,
    totalItemCount: 20,
    accessDetails: [
      {
        groupId: "g4",
        collectionId: "c4",
        groupName: "Group 4",
        collectionName: new EncString("Collection 4"),
        itemCount: 5,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
      {
        groupId: "g4",
        collectionId: "c5",
        groupName: "Group 4",
        collectionName: new EncString("Collection 5"),
        itemCount: 15,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
      {
        groupId: "",
        collectionId: "c4",
        groupName: "",
        collectionName: new EncString("Collection 4"),
        itemCount: 5,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
      {
        groupId: "",
        collectionId: "c5",
        groupName: "",
        collectionName: new EncString("Collection 5"),
        itemCount: 15,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
    ],
  },
  {
    userName: "Beth Williams",
    email: "bwilliams@email.com",
    twoFactorEnabled: true,
    accountRecoveryEnabled: true,
    groupsCount: 2,
    collectionsCount: 4,
    totalItemCount: 20,
    accessDetails: [
      {
        groupId: "",
        collectionId: "c6",
        groupName: "",
        collectionName: new EncString("Collection 6"),
        itemCount: 25,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
      {
        groupId: "g6",
        collectionId: "c4",
        groupName: "Group 6",
        collectionName: new EncString("Collection 4"),
        itemCount: 35,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
    ],
  },
  {
    userName: "Ray Williams",
    email: "rwilliams@email.com",
    twoFactorEnabled: false,
    accountRecoveryEnabled: false,
    groupsCount: 2,
    collectionsCount: 4,
    totalItemCount: 20,
    accessDetails: [
      {
        groupId: "",
        collectionId: "c7",
        groupName: "",
        collectionName: new EncString("Collection 7"),
        itemCount: 8,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
      {
        groupId: "",
        collectionId: "c8",
        groupName: "",
        collectionName: new EncString("Collection 8"),
        itemCount: 12,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
      {
        groupId: "",
        collectionId: "c9",
        groupName: "",
        collectionName: new EncString("Collection 9"),
        itemCount: 16,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
      {
        groupId: "g9",
        collectionId: "c7",
        groupName: "Group 9",
        collectionName: new EncString("Collection 7"),
        itemCount: 8,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
      {
        groupId: "g10",
        collectionId: "c8",
        groupName: "Group 10",
        collectionName: new EncString("Collection 8"),
        itemCount: 12,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
      {
        groupId: "g11",
        collectionId: "c9",
        groupName: "Group 11",
        collectionName: new EncString("Collection 9"),
        itemCount: 16,
        readOnly: false,
        hidePasswords: false,
        manage: false,
      },
    ],
  },
];
