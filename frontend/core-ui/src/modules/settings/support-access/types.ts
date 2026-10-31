export type TSupportAccessMode = 'off' | 'approval' | 'allow';

// expired: approved, but its end has passed
export type TSupportGrantStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'revoked'
  | 'expired';

export interface ISupportAccessPolicy {
  available: boolean;
  // What a visit meets now; differs from configuredMode once the allow window ends
  mode: TSupportAccessMode;
  configuredMode: TSupportAccessMode;
  allowUntil?: string | null;
  permissionGroupIds: string[];
}

export interface ISupportGrantVisit {
  enteredAt: string;
  reason: string;
}

export interface ISupportGrant {
  _id: string;
  staffName: string;
  staffEmail?: string | null;
  userId: string;
  reason: string;
  status: TSupportGrantStatus;
  autoApproved: boolean;
  permissionGroupIds: string[];
  decidedBy?: string | null;
  endsAt?: string | null;
  revokedAt?: string | null;
  visits: ISupportGrantVisit[];
  createdAt: string;
}

export type ISupportGrantSummary = Pick<
  ISupportGrant,
  '_id' | 'staffName' | 'endsAt'
>;
