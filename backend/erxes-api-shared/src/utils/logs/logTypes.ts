type IContext = {
    subdomain: string;
    processId?: string;
  };
  
  type AfterMutation = {
    type: 'afterMutation';
    mutationNames: string[];
  };
  
  type UpdatedDocument = {
    type: 'updatedDocument';
    contentTypes: string[];
    when?: {
      fieldsUpdated?: string[];
      fieldsRemoved?: string[];
    };
  };
  
  type CreateDocument = {
    type: 'createdDocument';
    contentTypes: string[];
    when?: {
      fieldsWith?: string[];
    };
  };
  
  type AfterAPIRequest = {
    type: 'afterAPIRequest';
    paths: string[];
  };
  
  type AfterAuth = {
    type: 'afterAuth';
    types: string[];
  };
  
  export type IAfterProcessRule =
    | AfterMutation
    | CreateDocument
    | UpdatedDocument
    | AfterAPIRequest
    | AfterAuth;
  
  export type TAfterProcessRule = {
    AfterMutation: AfterMutation;
    CreateDocument: CreateDocument;
    UpdatedDocument: UpdatedDocument;
    AfterAPIRequest: AfterAPIRequest;
    AfterAuth: AfterAuth;
  };
  
  export interface AfterProcessConfigs {
    rules: IAfterProcessRule[];
    onAfterMutation?: (
      context: IContext,
      args: { mutationName: string; args: { [key: string]: any }; result: any },
    ) => void;
    onAfterAuth?: (
      context: IContext,
      args: { userId: string; email: string; result: string },
    ) => void;
    onAfterApiRequest?: (context: IContext, args: any) => void;
    onDocumentUpdated?: <TDocument = any>(
      context: IContext,
      args: {
        contentType: string;
        fullDocument: TDocument;
        prevDocument: TDocument;
        updateDescription: {
          updatedFields: { [key: string]: any };
          removedFields: string[];
        };
      },
    ) => void;
    onDocumentCreated?: <TDocument = any>(
      context: IContext,
      args: {
        contentType: string;
        fullDocument: TDocument;
      },
    ) => void;
  }