export interface IActivity {
  _id: string;
  module: string;
  action: string;
  contentId: string;
  metadata: {
    newValue: string;
    previousValue?: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
