export interface IChecklistDoc {
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
    contentTypeId: string;
  }
  
  export type ChecklistsQueryResponse = {
    salesChecklists: IChecklist[];
    loading: boolean;
    refetch: () => void;
    subscribeToMore: any;
  };
  
  export type AddMutationResponse = (args: {
    variables: IChecklistDoc
  }) => Promise<any>;
  
  export type EditMutationVariables = {
    _id: string;
    title: string;
  } & IChecklistsParam;
  
  export type EditMutationResponse = (args: {
    variables: EditMutationVariables
  }) => Promise<any>;
  
  export type RemoveMutationResponse = (args: {
    variables: { _id: string }
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
  
  export type AddItemMutationResponse = (args: {
    variables: IChecklistItemDoc
  }) => Promise<any>;
  
  export type UpdateItemsOrderMutationResponse = (args: {
    variables: IChecklistItemsUpdateOrderDoc
  }) => Promise<any>;
  
  export type EditItemMutationVariables = {
    _id: string;
  } & IChecklistItemDoc;
  
  export type EditItemMutationResponse = (args: {
    variables: EditItemMutationVariables
  }) => Promise<any>;
  