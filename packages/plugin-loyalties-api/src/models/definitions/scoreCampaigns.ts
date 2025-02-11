import { Document, Schema } from "mongoose";
import { field } from "./utils";

export const SCORE_CAMPAIGN_STATUSES = {
  PUBLISHED: "published",
  DRAFT: "draft",
  ARCHIVED: "archived"
};

export interface IScoreCampaign {
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
  fieldGroupId: string;
  fieldName: string;
  fieldId: string;
  status: string;
}

export interface IScoreCampaignDocuments extends Document, IScoreCampaign {
  _id: string;
}

const addSchema = new Schema(
  {
    placeholder: field({ type: String, label: "Placeholder" }),
    currencyRatio: field({ type: String, label: "currencyRatio", default: 1 })
  },
  { _id: false }
);

const subtractSchema = new Schema(
  {
    placeholder: field({ type: String, label: "Placeholder" }),
    currencyRatio: field({ type: String, label: "currencyRatio", default: 1 })
  },
  { _id: false }
);

export const scoreCampaignSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String, label: "Campaign Title" }),
  description: field({ type: String, label: "Campaign Description" }),
  add: field({ type: addSchema, label: "Add config" }),
  subtract: field({ type: subtractSchema, label: "Subtract config" }),
  createdAt: field({ type: Date, label: "Created At", default: new Date() }),
  createdUserId: field({ type: String, label: "Created User Id" }),
  ownerType: field({ type: String, label: "Owner Type" }),
  fieldGroupId: field({ type: String, label: "Field Group" }),
  fieldName: field({ type: String, label: "Field Name" }),
  fieldId: field({ type: String, label: "Field Id" }),
  status: field({
    type: String,
    enum: Object.values(SCORE_CAMPAIGN_STATUSES),
    default: SCORE_CAMPAIGN_STATUSES.DRAFT
  })
});
