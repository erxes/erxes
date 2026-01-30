import { Schema } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { SCORE_CAMPAIGN_STATUSES } from '../../constants';

const actionConfigSchema = new Schema(
  {
    placeholder: {
      type: String,
      label: 'Placeholder',
      required: true,
    },

    currencyRatio: {
      type: Number,
      label: 'Currency ratio',
      default: 1,
    },
  },
  { _id: false },
);

/* -------------------- main schema -------------------- */

export const scoreCampaignSchema = schemaWrapper(
  new Schema(
    {
      name: {
        type: String,
        label: 'Campaign name',
        required: true,
      },

      description: {
        type: String,
        label: 'Campaign description',
        optional: true,
      },

      ownerType: {
        type: String,
        label: 'Owner type',
        required: true,
      },

      fieldGroupId: {
        type: String,
        label: 'Field group',
        optional: true,
      },

      fieldName: {
        type: String,
        label: 'Field name',
        optional: true,
      },

      fieldId: {
        type: String,
        label: 'Field id',
        required: true,
      },

      add: {
        type: actionConfigSchema,
        label: 'Add config',
        optional: true,
      },

      subtract: {
        type: actionConfigSchema,
        label: 'Subtract config',
        optional: true,
      },

      status: {
        type: String,
        enum: Object.values(SCORE_CAMPAIGN_STATUSES),
        default: SCORE_CAMPAIGN_STATUSES.DRAFT,
      },

      serviceName: {
        type: String,
        label: 'Service name',
        required: true,
      },

      additionalConfig: {
        type: Schema.Types.Mixed,
        label: 'Additional config',
        optional: true,
      },

      onlyClientPortal: {
        type: Boolean,
        label: 'Only client portal',
        default: false,
      },

      restrictions: {
        type: Schema.Types.Mixed,
        label: 'Restrictions',
        optional: true,
      },

      createdBy: {
        type: String,
        label: 'Created by',
      },

      updatedBy: {
        type: String,
        label: 'Updated by',
      },
    },
    {
      timestamps: true,
    },
  ),
);
