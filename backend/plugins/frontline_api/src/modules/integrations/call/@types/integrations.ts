export interface CallOperator {
  userId: string;
  gsUsername: string;
  gsPassword: string;
  gsForwardAgent: boolean;
}

export interface ICallIntegration {
  inboxId: string;
  wsServer: string;
  phone: string;
  operators: CallOperator[];
  token: string;
  queues: [string];
  queueNames: [string];
  srcTrunk: string;
  dstTrunk: string;
}

export interface ICallIntegrationDocument extends ICallIntegration, Document {}
