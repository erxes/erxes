export interface IAttribution {
  _id: string;
  email?: string;
  username?: string;
  isOwner?: boolean;
  configs?: any;
  isOnboarded: boolean;
  details?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    avatar?: string;
  };
}