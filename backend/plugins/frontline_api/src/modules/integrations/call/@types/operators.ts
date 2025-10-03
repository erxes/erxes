export interface ICallOperator {
  userId: string;
  extension: string;
  status: string;
}

export interface ICallOperatorDocuments extends ICallOperator, Document {}
