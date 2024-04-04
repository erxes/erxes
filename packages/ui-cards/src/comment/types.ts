import { QueryResponse } from '@erxes/ui/src/types';

export interface IChecklistDoc {
  contentType: string;
  contentTypeId: string;
  title: string;
}

export interface IChecklist extends IChecklistDoc {
  _id: string;
  createdUserId: string;
  createdDate: Date;
  items: IChecklistItem[];
  percent: number;
}

export interface IChecklistsParam {
  contentType: string;
  contentTypeId: string;
}

export type ChecklistsQueryResponse = {
  checklists: IChecklist[];
  loading: boolean;
  refetch: () => void;
  subscribeToMore: any;
};

export type AddMutationResponse = ({
  variables: IChecklistDoc
}) => Promise<any>;

export type EditMutationVariables = {
  _id: string;
  title: string;
} & IChecklistsParam;

export type EditMutationResponse = ({
  variables: EditMutationVariables
}) => Promise<any>;

export type RemoveMutationResponse = ({
  variables: MutationVariables
}) => Promise<any>;

// checklists items

export interface IChecklistItemDoc {
  checklistId: string;
  isChecked?: boolean;
  content: string;
}

export interface IChecklistItemsUpdateOrderDoc {
  _id: string;
  destinationIndex: number;
}

export interface IChecklistItem extends IChecklistItemDoc {
  _id: string;
}

export type AddItemMutationResponse = ({
  variables: IChecklistItemDoc
}) => Promise<any>;

export type UpdateItemsOrderMutationResponse = ({
  variables: IChecklistItemsUpdateOrderDoc
}) => Promise<any>;

export type EditItemMutationVariables = {
  _id: string;
} & IChecklistItemDoc;

export type EditItemMutationResponse = ({
  variables: EditItemMutationVariables
}) => Promise<any>;

/*   Client portal comment items   */

export type CommentAddMutationVariables = {
  typeId: string;
  type: string;
  content: string;
  userType: string;
};

export type CommentAddMutationResponse = {
  commentAdd: (params: {
    variables: CommentAddMutationVariables;
  }) => Promise<any>;
};

export type ICommentCreatedUser = {
  _id: string;
  avatar: string;
  firstName: string;
  fullName: string;
  lastName: string;
  email: string;
  username: string;
};

export type IClientPortalComment = {
  _id: string;
  content: string;
  createdUser: ICommentCreatedUser;
  createdAt: Date;
  userType: string;
  type: string;
};

export type ClientPortalCommentQueryResponse = {
  clientPortalComments: IClientPortalComment[];
} & QueryResponse;

export type CommentRemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};
