import { COMPANY_SELECT_OPTIONS } from '@/contacts/constants';
import { customFieldSchema } from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const getEnum = (fieldName: string): string[] => {
  return COMPANY_SELECT_OPTIONS[fieldName].map((option) => option.value);
};

export const companySchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,

      primaryName: {
        type: String,
        label: 'Name',
        optional: true,
        esType: 'keyword',
      },

      names: {
        type: [String],
        optional: true,
        label: 'Names',
      },

      avatar: {
        type: String,
        optional: true,
        label: 'Avatar',
      },

      size: {
        type: Number,
        label: 'Size',
        optional: true,
        esType: 'number',
      },

      industry: {
        type: String,
        label: 'Industries',
        optional: true,
        esType: 'keyword',
      },

      website: {
        type: String,
        label: 'Website',
        optional: true,
      },

      plan: {
        type: String,
        label: 'Plan',
        optional: true,
      },

      parentCompanyId: {
        type: String,
        optional: true,
        label: 'Parent Company',
      },

      primaryEmail: {
        type: String,
        optional: true,
        label: 'Primary email',
        esType: 'email',
      },
      emails: { type: [String], optional: true, label: 'Emails' },

      primaryPhone: {
        type: String,
        optional: true,
        label: 'Primary phone',
      },
      phones: { type: [String], optional: true, label: 'Phones' },

      primaryAddress: {
        type: Object,
        label: 'Primary Address',
        optional: true,
      },
      addresses: { type: [Object], optional: true, label: 'Addresses' },

      ownerId: { type: String, optional: true },

      status: {
        type: String,
        enum: getEnum('STATUSES'),
        default: 'Active',
        optional: true,
        label: 'Status',
        esType: 'keyword',
        selectOptions: COMPANY_SELECT_OPTIONS.STATUSES,
        index: true,
      },

      businessType: {
        type: String,
        enum: getEnum('BUSINESS_TYPES'),
        optional: true,
        label: 'Business Type',
        esType: 'keyword',
        selectOptions: COMPANY_SELECT_OPTIONS.BUSINESS_TYPES,
      },

      description: { type: String, optional: true, label: 'Description' },
      employees: { type: Number, optional: true, label: 'Employees' },
      doNotDisturb: {
        type: String,
        optional: true,
        default: 'No',
        enum: getEnum('DO_NOT_DISTURB'),
        label: 'Do not disturb',
        selectOptions: COMPANY_SELECT_OPTIONS.DO_NOT_DISTURB,
      },
      isSubscribed: {
        type: String,
        optional: true,
        default: 'Yes',
        enum: getEnum('DO_NOT_DISTURB'),
        label: 'Subscribed',
        selectOptions: COMPANY_SELECT_OPTIONS.DO_NOT_DISTURB,
      },
      links: { type: Object, default: {}, label: 'Links' },

      tagIds: {
        type: [String],
        optional: true,
        label: 'Tags',
        index: true,
      },

      // Merged company ids
      mergedIds: {
        type: [String],
        optional: true,
        label: 'Merged companies',
      },

      customFieldsData: {
        type: [customFieldSchema],
        optional: true,
        label: 'Custom fields data',
      },

      trackedData: {
        type: [customFieldSchema],
        optional: true,
        label: 'Tracked Data',
      },
      searchText: { type: String, optional: true },
      code: { type: String, label: 'Code', optional: true },
      location: { type: String, optional: true, label: 'Location' },
      score: {
        type: Number,
        optional: true,
        label: 'Score',
        esType: 'number',
      },
    },
    {
      timestamps: true,
    },
  ),
);

companySchema.index({ _id: 1, createdAt: 1, searchText: 1 });
