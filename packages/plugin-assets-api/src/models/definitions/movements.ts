import { Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export const sourceLocationsShema = new Schema(
  {
    branchId: field({ type: String, label: 'Branch Id' }),
    departmentId: field({ type: String, label: 'Department Id' }),
    customerId: field({ type: String, label: 'Customer Id' }),
    teamMemberId: field({ type: String, label: 'Team Member Id' }),
    companyId: field({ type: String, label: 'Company Id' })
  },
  { _id: false }
);

export const movementItemsSchema = schemaWrapper(
  new Schema({
    assetId: field({ type: String, label: 'Asset Id' }),
    createdAt: field({ type: Date, label: 'Created At', default: Date.now }),
    branchId: field({ type: String, optional: true, label: 'Branch Id' }),
    departmentId: field({
      type: String,
      optional: true,
      label: 'Department Id'
    }),
    teamMemberId: field({
      type: String,
      optional: true,
      label: 'Team Member Id'
    }),
    companyId: field({ type: String, optional: true, label: 'Company Id' }),
    customerId: field({ type: String, optional: true, label: 'Customer Id' }),
    movementId: field({ type: String, optional: true, label: 'Movement Id' }),
    sourceLocations: field({
      type: sourceLocationsShema,
      label: 'Source Locations',
      default: {}
    })
  })
);

export const movementSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date, label: 'Created At' }),
    modifiedAt: field({ type: Date, label: 'Modified At' }),
    movedAt: field({ type: Date, label: 'Moved Date' }),
    description: field({ type: String, label: 'Description' }),
    userId: field({ type: String, label: 'User ID' })
  })
);
