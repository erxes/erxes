import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IOrgWhiteLabel,
  IOrgWhiteLabelDocument,
} from '@/organization/whitelabel/@types/orgWhiteLabel';
import { orgWhiteLabelSchema } from '@/organization/whitelabel/db/definitions/orgWhiteLabel';

const SINGLETON_ID = 'ORG_WHITE_LABEL';

export interface IOrgWhiteLabelModel extends Model<IOrgWhiteLabelDocument> {
  getOrgWhiteLabel(): Promise<IOrgWhiteLabelDocument | null>;
  upsertOrgWhiteLabel(
    orgWhiteLabel: IOrgWhiteLabel,
  ): Promise<IOrgWhiteLabelDocument>;
}

export const loadOrgWhiteLabelClass = (models: IModels) => {
  class OrgWhiteLabel {
    public static async getOrgWhiteLabel() {
      return models.OrgWhiteLabel.findOne({}).lean();
    }

    public static async upsertOrgWhiteLabel(orgWhiteLabel: IOrgWhiteLabel) {
      return models.OrgWhiteLabel.findOneAndUpdate(
        { _id: SINGLETON_ID },
        {
          ...orgWhiteLabel,
          _id: SINGLETON_ID,
        },
        {
          upsert: true,
          new: true,
        },
      ).lean();
    }
  }

  orgWhiteLabelSchema.loadClass(OrgWhiteLabel);
  return orgWhiteLabelSchema;
};
