import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import {
  STRUCTURE_ENTITY_STATUSES,
  STRUCTURE_SEAT_COVERAGES,
} from '../../constants';

export const structureEntityTypeSchema = schemaWrapper(
  new Schema(
    {
      name: { type: String, required: true, label: 'Name' },
      code: { type: String, required: true, unique: true, label: 'Code' },
      description: { type: String, label: 'Description' },
      icon: { type: String, label: 'Icon' },
      parentTypeIds: { type: [String], default: [], label: 'Parent types' },
      capabilities: { type: [String], default: [], label: 'Capabilities' },
      legacyKind: {
        type: String,
        enum: ['branch', 'department', 'unit'],
        label: 'Client portal kind',
      },
      isSystem: { type: Boolean, default: false, label: 'System type' },
      createdBy: { type: String, label: 'Created by' },
      updatedBy: { type: String, label: 'Updated by' },
    },
    { timestamps: true },
  ),
);

const coordinateSchema = new Schema(
  {
    latitude: { type: String },
    longitude: { type: String },
  },
  { _id: false },
);

const locationSchema = new Schema(
  {
    address: { type: String },
    coordinate: { type: coordinateSchema },
    radius: { type: Number },
  },
  { _id: false },
);

const contactSchema = new Schema(
  {
    phoneNumber: { type: String },
    email: { type: String },
    links: { type: Object },
    image: { type: attachmentSchema },
  },
  { _id: false },
);

const scheduleSchema = new Schema(
  {
    workhours: { type: Object },
    holidays: { type: Object },
  },
  { _id: false },
);

export const structureEntitySchema = schemaWrapper(
  new Schema(
    {
      typeId: { type: String, required: true, index: true, label: 'Type' },
      parentId: { type: String, index: true, label: 'Parent' },
      order: { type: String, required: true, unique: true, label: 'Path' },
      title: { type: String, required: true, label: 'Title' },
      code: { type: String, unique: true, sparse: true, label: 'Code' },
      description: { type: String, label: 'Description' },
      status: {
        type: String,
        enum: Object.values(STRUCTURE_ENTITY_STATUSES),
        default: STRUCTURE_ENTITY_STATUSES.ACTIVE,
        index: true,
        label: 'Status',
      },
      location: { type: locationSchema, label: 'Location' },
      contact: { type: contactSchema, label: 'Contact' },
      schedule: { type: scheduleSchema, label: 'Schedule' },
      propertiesData: { type: Schema.Types.Mixed, label: 'Properties data' },
      archivedAt: { type: Date, label: 'Archived at' },
      archivedBy: { type: String, label: 'Archived by' },
      createdBy: { type: String, label: 'Created by' },
      updatedBy: { type: String, label: 'Updated by' },
    },
    { timestamps: true },
  ),
);

export const structureEntityMemberSchema = schemaWrapper(
  new Schema(
    {
      entityId: { type: String, required: true, label: 'Node' },
      userId: { type: String, required: true, index: true, label: 'User' },
      seatIds: { type: [String], default: [], index: true, label: 'Seats' },
      isPrimary: { type: Boolean, default: false, label: 'Primary' },
      startsAt: { type: Date, default: Date.now, label: 'Starts at' },
      endsAt: { type: Date, label: 'Ends at' },
      createdBy: { type: String, label: 'Created by' },
      endedBy: { type: String, label: 'Ended by' },
    },
    { timestamps: true },
  ),
);

structureEntityMemberSchema.index({ entityId: 1, userId: 1, endsAt: 1 });

export const structurePositionSchema = schemaWrapper(
  new Schema(
    {
      name: { type: String, required: true, unique: true, label: 'Name' },
      description: { type: String, label: 'Description' },
      groupIds: { type: [String], default: [], label: 'Permission groups' },
      createdBy: { type: String, label: 'Created by' },
      updatedBy: { type: String, label: 'Updated by' },
    },
    { timestamps: true },
  ),
);

export const structureSeatSchema = schemaWrapper(
  new Schema(
    {
      positionId: {
        type: String,
        required: true,
        index: true,
        label: 'Position',
      },
      entityId: { type: String, required: true, index: true, label: 'Node' },
      coverage: {
        type: String,
        enum: Object.values(STRUCTURE_SEAT_COVERAGES),
        required: true,
        label: 'Coverage',
      },
      coveredEntityIds: { type: [String], default: [], label: 'Covered nodes' },
      createdBy: { type: String, label: 'Created by' },
      updatedBy: { type: String, label: 'Updated by' },
    },
    { timestamps: true },
  ),
);
