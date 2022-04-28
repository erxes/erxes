export interface IErkhetResponse {
  createdAt: Date;
  contractId: string;
  transactionId?: string;
  isEbarimt: boolean;
  data: any;
}

export interface IErkhetResponseDocument extends IErkhetResponse {
  _id: string;
}

export const erkhetResponseSchema = {
  _id: { pkey: true },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },
  contractId: { type: String, label: 'Contract' },
  transactionId: { type: String, optional: true, label: 'transaction' },
  isEbarimt: { type: String, default: false, label: 'Is Ebarimt' },
  data: { type: Object, label: 'Response data' },
};
