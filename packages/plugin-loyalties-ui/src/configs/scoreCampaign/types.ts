export type IScoreCampaign = {
  _id: string;
  title: string;
  description: string;
  add: {
    placeholder: string;
    currencyRatio: string;
  };
  subtract: {
    placeholder: string;
    currencyRatio: string;
  };
  createdAt: Date;
  createdUserId: string;
  ownerType: string;
  status: "published" | "draft" | "archived";
};
