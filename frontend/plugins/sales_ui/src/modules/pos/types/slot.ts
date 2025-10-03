export interface PosSlotBulkUpdateVariables {
    posId: string;
    slots: SlotInput[];
  }
  
  export interface PosSlotBulkUpdateResult {
    posSlotBulkUpdate: {
      _id: string;
      __typename: string;
    }[];
  }
  
  export interface SlotInput {
    productId?: string;
    code?: string;
    index?: number;
    isLocked?: boolean;
    _id?: string;
  }
  