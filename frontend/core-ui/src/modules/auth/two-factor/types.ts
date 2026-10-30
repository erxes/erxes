export interface ITwoFactorSetup {
  secret: string;
  otpauthUrl: string;
}

export interface ITwoFactorStatus {
  available: boolean;
  enabled: boolean;
  required: boolean;
  recoveryCodesLeft: number;
}

/** Handed back by login when the second factor is still needed. */
export interface ITwoFactorChallenge {
  challenge: string;
  setup: boolean;
}
