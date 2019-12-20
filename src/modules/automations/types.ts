export interface IAutomationDoc {
  name: string;
}

export interface IAutomation extends IAutomationDoc {
  _id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Date;
  modifiedAt: Date;
  shapes: IShape[];
}

export type AutomationsQueryResponse = {
  automations: IAutomation[];
  loading: boolean;
  refetch: () => void;
};

export type AddMutationResponse = (
  { variables: IAutomationDoc }
) => Promise<any>;

export type EditMutationVariables = {
  _id: string;
  name: string;
  description: string;
};

export type EditMutationResponse = (
  { variables: EditMutationVariables }
) => Promise<any>;

export type RemoveMutationVariables = {
  _id: string;
};

export type RemoveMutationResponse = (
  { variables: RemoveMutationVariables }
) => Promise<any>;

// automations shapes

export interface IShapeDoc {
  automationId: string;
  async?: boolean;
  type: string;
  kind: string;
}

export interface IShape extends IShapeDoc {
  _id: string;
}

export type AddShapeMutationResponse = (
  { variables: IShapeDoc }
) => Promise<any>;

export type EditShapeMutationVariables = {
  _id: string;
} & IShapeDoc;

export type EditShapeMutationResponse = (
  { variables: EditShapeMutationVariables }
) => Promise<any>;

export type RemoveShapeMutationVariables = {
  _id: string;
};

export type RemoveShapeMutationResponse = (
  { variables: RemoveShapeMutationVariables }
) => Promise<any>;
