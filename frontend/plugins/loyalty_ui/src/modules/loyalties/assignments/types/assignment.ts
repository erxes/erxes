export interface IAssignmentItem {
  _id: string;
  campaignId?: string;
  campaign?: { _id?: string; title?: string };
  ownerType?: string;
  ownerId?: string;
  owner?: {
    primaryPhone?: string;
    primaryEmail?: string;
    firstName?: string;
    lastName?: string;
  };
  status?: string;
  createdAt?: string;
  usedAt?: string;
}
