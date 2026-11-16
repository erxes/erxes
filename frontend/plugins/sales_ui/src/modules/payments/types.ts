export type PaymentConfigItem = {
  _id?: string;
  type: string;
  title: string;
  icon: string;
  config?: string;
  // Pays from this loyalty wallet; the row is kept by the Loyalty section.
  accountTypeId?: string;
  // Not moved to a wallet yet (its campaign has none); kept as it is.
  scoreCampaignId?: string;
};
