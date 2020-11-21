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

export type RemoveMutationVariables = {
  _id: string;
};

export type RemoveMutationResponse = ({
  variables: RemoveMutationVariables
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

export type RemoveItemMutationVariables = {
  _id: string;
};

export type RemoveItemMutationResponse = ({
  variables: RemoveItemMutationVariables
}) => Promise<any>;
