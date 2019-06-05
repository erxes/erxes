export interface IPipeline {
  _id: string;
  name: string;
  boardId?: string;
  order?: number;
  visibility?: string;
  memberIds?: string[];
  createdAt?: Date;
}

export interface IBoard {
  _id: string;
  name: string;
  order: number;
  createdAt: Date;
  pipelines: IPipeline;
}

export interface IStage {
  _id: string;
  name: string;
  probability?: string;
  pipelineId: string;
  amount?: JSON;
  order?: number;
  createdAt?: Date;
}

export interface IOrder {
  _id: string;
  order: number;
}

// queries
export type BoardsQueryResponse = {
  boards: IBoard[];
  loading: boolean;
  refetch: () => void;
};

export type BoardsGetLastQueryResponse = {
  boardGetLast: IBoard;
  loading: boolean;
  refetch: () => void;
};

export type BoardsDetailQueryResponse = {
  boardDetail: IBoard;
  loading: boolean;
  refetch: () => void;
};

export type PipelineQueryResponse = {
  pipelines: IPipeline[];
  loading: boolean;
  refetch: () => void;
};

export type StagesQueryResponse = {
  stages: IStage[];
  loading: boolean;
  refetch: () => void;
};

// mutations
export type AddBoardMutationVariables = {
  name: string;
};

export type AddBoardMutationResponse = {
  addMutation: (
    params: {
      variables: AddBoardMutationVariables;
    }
  ) => Promise<void>;
};

export type EditBoardMutationVariables = {
  _id?: string;
  name: string;
};

export type EditBoardMutationResponse = {
  editMutation: (
    params: {
      variables: EditBoardMutationVariables;
    }
  ) => Promise<void>;
};

export type RemoveBoardMutationVariables = {
  _id: string;
};

export type RemoveBoardMutationResponse = {
  removeMutation: (
    params: {
      variables: RemoveBoardMutationVariables;
    }
  ) => Promise<void>;
};

export type AddPipelineMutationVariables = {
  name: string;
  boardId: string;
  stages: IStage;
  visibility: string;
  memberIds: string[];
};

export type AddPipelineMutationResponse = {
  addPipelineMutation: (
    params: {
      variables: AddPipelineMutationVariables;
    }
  ) => Promise<void>;
};

export type EditPipelineMutationVariables = {
  _id?: string;
  name: string;
  boardId: string;
  stages: IStage;
  visibility: string;
  memberIds: string[];
};

export type EditPipelineMutationResponse = {
  editPipelineMutation: (
    params: {
      variables: EditPipelineMutationVariables;
    }
  ) => Promise<void>;
};

export type RemovePipelineMutationVariables = {
  _id: string;
};

export type RemovePipelineMutationResponse = {
  removePipelineMutation: (
    params: {
      variables: RemovePipelineMutationVariables;
    }
  ) => Promise<void>;
};

export type UpdateOrderPipelineMutationVariables = {
  orders: IOrder;
};

export type UpdateOrderPipelineMutationResponse = {
  pipelinesUpdateOrderMutation: (
    params: {
      variables: UpdateOrderPipelineMutationVariables;
    }
  ) => Promise<void>;
};
