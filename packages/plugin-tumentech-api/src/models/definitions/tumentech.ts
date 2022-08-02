import { Document, Schema } from 'mongoose';

import { CAR_SELECT_OPTIONS } from '../../constants';
import { field, schemaHooksWrapper } from './utils';

const getEnum = (fieldName: string): string[] => {
  return CAR_SELECT_OPTIONS[fieldName].map(option => option.value);
};

export interface ICar {
  plateNumber: string;
  vinNumber: string;
  color: string;
  intervalValue: string;
  categoryId: string;
  vintageYear: Number;
  importYear: Number;
  diagnosisDate: Date;
  taxDate: Date;
  manufacture: String;
  steeringWheel: String;
  transmission: String;
  drivingClassification: String;
  carModel: String;
  mark: String;
  doors: String;
  seats: String;
  fuelType: String;
  engineCapacity: String;
  engineChange: String;
  listChange: String;
  type: String;
  ownerBy: String;
  repairService: String;
  interval: String[];
  running: String;
  trailerType: String;
  tireLoadType: String;
  bowType: String;
  brakeType: String;
  liftType: String;
  liftWagonCapacity: String[];
  liftWagonCapacityValue: String;
  wagonCapacity: String[];
  wagonCapacityValue: String;
  totalAxis: String;
  steeringAxis: String;
  forceAxis: String;
  floorType: String;
  pumpCapacity: String;
  barrelNumber: String;
  status: String;
  description: String;

  // Merged car ids
  mergedIds: String[];
  searchText: String;
  attachments?: any;
  frontAttachments?: any;
  leftAttachments?: any;
  rightAttachments?: any;
  backAttachments?: any;
  floorAttachments?: any;
  transformationAttachments?: any;

  meterWarranty: Date;
  liftHeight: Number;
  height: Number;
  weight: Number;
  wagonLength: Number;
  wagonWidth: Number;

  porchekHeight: Number;
  runningValue: Number;
  volume: Number;
  capacityL: Number;
  barrel1: Number;
  barrel2: Number;
  barrel3: Number;
  barrel4: Number;
  barrel5: Number;
  barrel6: Number;
  barrel7: Number;
  barrel8: Number;
  forceCapacityValue: Number;
  forceValue: Number;
}

export interface ICarDocument extends ICar, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  ownerId: string;
  searchText: string;
}

export interface ICarCategory {
  name: string;
  code: string;
  parentId?: string;
  description?: string;
  collapseContent?: string[];
}

export interface ICarCategoryDocument extends ICarCategory, Document {
  _id: string;
  order: string;
  createdAt: Date;
}

export interface IProductCarCategory {
  carCategoryId: String;
  productCategoryId: String;
}

export interface IProductCarCategoryDocument
  extends IProductCarCategory,
    Document {
  _id: string;
}

const attachmentSchema = schemaHooksWrapper(
  new Schema({
    name: field({ type: String }),
    url: field({ type: String }),
    type: field({ type: String }),
    size: field({ type: Number, optional: true })
  }),
  'erxes_attachmentSchema'
);

const fourAttachmentSchema = schemaHooksWrapper(
  new Schema({
    name: field({ type: String }),
    url: field({ type: String }),
    type: field({ type: String }),
    size: field({ type: Number, optional: true })
  }),
  'erxes_fourAttachmentSchema'
);

const floorAttachmentSchema = schemaHooksWrapper(
  new Schema({
    name: field({ type: String }),
    url: field({ type: String }),
    type: field({ type: String }),
    size: field({ type: Number, optional: true })
  }),
  'erxes_floorAttachmentSchema'
);

const transformationAttachmentSchema = schemaHooksWrapper(
  new Schema({
    name: field({ type: String }),
    url: field({ type: String }),
    type: field({ type: String }),
    size: field({ type: Number, optional: true })
  }),
  'erxes_transformationAttachmentSchema'
);

export const productCarCategorySchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    carCategoryId: field({ type: String, label: 'Category' }),
    productCategoryId: field({ type: String, label: 'Category' })
  }),
  'erxes_productCarCategorySchema'
);

export const carCategorySchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    order: field({ type: String, label: 'Order' }),
    parentId: field({ type: String, optional: true, label: 'Parent' }),
    collapseContent: field({
      type: [String],
      enum: getEnum('COLLAPSE_CONTENT_SELECTOR'),
      default: '',
      optional: true,
      label: 'Collapse content',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.COLLAPSE_CONTENT_SELECTOR
    }),
    description: field({ type: String, optional: true, label: 'Description' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    })
  }),
  'erxes_carCategorySchema'
);

export const carSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date, label: 'Created at' }),
    modifiedAt: field({ type: Date, label: 'Modified at' }),

    plateNumber: field({
      type: String,
      label: 'Plate number',
      index: true,
      optional: true
    }),
    vinNumber: field({
      type: String,
      label: 'VIN number',
      optional: true,
      index: true
    }),
    color: field({ type: String, label: 'Color', optional: true }),
    intervalValue: field({
      type: String,
      label: 'Interval value',
      optional: true
    }),
    categoryId: field({ type: String, label: 'Category', index: true }),

    vintageYear: field({
      type: Number,
      label: 'Vintage year',
      optional: true,
      default: new Date().getFullYear()
    }),
    importYear: field({
      type: Number,
      label: 'Imported year',
      optional: true,
      default: new Date().getFullYear()
    }),

    diagnosisDate: field({
      type: Date,
      optional: true,
      label: 'Оношлогоо огноо'
    }),
    taxDate: field({ type: Date, optional: true, label: 'Татвар огноо' }),

    manufacture: field({
      type: String,
      enum: getEnum('MANUFACTURE_TYPES'),
      default: '',
      optional: true,
      label: 'Manufacture',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.MANUFACTURE_TYPES
    }),

    steeringWheel: field({
      type: String,
      enum: getEnum('STEERING_WHEEL'),
      default: 'left',
      optional: true,
      label: 'Status',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.STEERING_WHEEL,
      index: true
    }),

    transmission: field({
      type: String,
      enum: getEnum('TRANSMISSION_TYPES'),
      default: '',
      optional: true,
      label: 'Transmission',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.TRANSMISSION_TYPES
    }),

    drivingClassification: field({
      type: String,
      enum: getEnum('DRIVING_CLASSIFICATION'),
      default: '',
      optional: true,
      label: 'Driving classification',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.DRIVING_CLASSIFICATION
    }),

    carModel: field({
      type: String,
      optional: true,
      label: 'Car model'
    }),

    mark: field({
      type: String,
      optional: true,
      label: 'Mark'
    }),

    doors: field({
      type: String,
      enum: getEnum('DOOR_CHANGE'),
      default: '',
      optional: true,
      label: 'Door',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.DOOR_CHANGE
    }),

    seats: field({
      type: String,
      enum: getEnum('SEAT_CHANGE'),
      default: '',
      optional: true,
      label: 'Seat',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.SEAT_CHANGE
    }),

    fuelType: field({
      type: String,
      enum: getEnum('FUEL_TYPES'),
      default: '',
      optional: true,
      label: 'Brand',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.FUEL_TYPES
    }),

    engineCapacity: field({
      type: String,
      optional: true,
      label: 'Хөдөлгүүрийн багтаамж'
    }),

    engineChange: field({
      type: String,
      enum: getEnum('ENGINE_CHANGE'),
      default: '',
      optional: true,
      label: 'Engine change',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.ENGINE_CHANGE
    }),

    listChange: field({
      type: String,
      enum: getEnum('LIFT_CHANGE'),
      default: '',
      optional: true,
      label: 'Lift change',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.LIFT_CHANGE
    }),

    type: field({
      type: String,
      optional: true,
      label: 'Type'
    }),

    ownerBy: field({
      type: String,
      enum: getEnum('OWNER_TYPES'),
      default: '',
      optional: true,
      label: 'Owner',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.OWNER_TYPES
    }),

    repairService: field({
      type: String,
      enum: getEnum('REPAIR_SERVICE_TYPES'),
      default: '',
      optional: true,
      label: 'Repair service',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.REPAIR_SERVICE_TYPES
    }),

    interval: field({
      type: [String],
      enum: getEnum('INTERVAL_TYPES'),
      default: '',
      optional: true,
      label: 'Interval type',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.INTERVAL_TYPES
    }),

    running: field({
      type: String,
      enum: getEnum('RUNNING_TYPES'),
      default: '',
      optional: true,
      label: 'Running',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.RUNNING_TYPES
    }),

    trailerType: field({
      type: String,
      enum: getEnum('TRAILER_TYPES'),
      default: '',
      optional: true,
      label: 'Trailer type',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.TRAILER_TYPES
    }),

    tireLoadType: field({
      type: String,
      enum: getEnum('TIRE_LOAD_TYPES'),
      default: '',
      optional: true,
      label: 'Tire load type',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.TIRE_LOAD_TYPES
    }),

    bowType: field({
      type: String,
      enum: getEnum('BOW_TYPES'),
      default: '',
      optional: true,
      label: 'Bow type',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.BOW_TYPES
    }),

    brakeType: field({
      type: String,
      enum: getEnum('BRAKE_TYPES'),
      default: '',
      optional: true,
      label: 'Brake type',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.BRAKE_TYPES
    }),

    liftType: field({
      type: String,
      enum: getEnum('LIFT_TYPE'),
      default: '',
      optional: true,
      label: 'Lift type',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.LIFT_TYPE
    }),

    liftWagonCapacity: field({
      type: [String],
      enum: getEnum('LIFT_WAGON_CAPACITY_TYPES'),
      default: '',
      optional: true,
      label: 'Өргөлт Даац багтаамж',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.LIFT_WAGON_CAPACITY_TYPES
    }),

    liftWagonCapacityValue: field({
      type: String,
      optional: true,
      label: 'Өргөлт Даац багтаамж'
    }),

    wagonCapacity: field({
      type: [String],
      enum: getEnum('WAGON_CAPACITY_TYPES'),
      default: '',
      optional: true,
      label: 'Даац багтаамж',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.WAGON_CAPACITY_TYPES
    }),

    wagonCapacityValue: field({
      type: String,
      optional: true,
      label: 'Даац багтаамж утга'
    }),

    totalAxis: field({
      type: String,
      optional: true,
      label: 'Нийт тэнхлэг'
    }),

    steeringAxis: field({
      type: String,
      optional: true,
      label: 'Залуурын тэнхлэг'
    }),

    forceAxis: field({
      type: String,
      optional: true,
      label: 'Зүтгэх тэнхлэг'
    }),

    floorType: field({
      type: String,
      enum: getEnum('FLOOR_TYPE'),
      default: '',
      optional: true,
      label: 'Floor type',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.FLOOR_TYPE
    }),

    pumpCapacity: field({
      type: String,
      optional: true,
      label: 'Насосны чадал /л/мин/'
    }),

    barrelNumber: field({
      type: String,
      optional: true,
      label: 'Торхны дугаар'
    }),

    status: field({
      type: String,
      enum: getEnum('STATUSES'),
      default: 'Active',
      optional: true,
      label: 'Status',
      esType: 'keyword',
      selectOptions: CAR_SELECT_OPTIONS.STATUSES,
      index: true
    }),

    description: field({ type: String, optional: true, label: 'Description' }),

    // Merged car ids
    mergedIds: field({ type: [String], optional: true, label: 'Merged cars' }),

    searchText: field({ type: String, optional: true, index: true }),

    attachments: field({ type: [attachmentSchema] }),
    frontAttachments: field({ type: [fourAttachmentSchema] }),
    leftAttachments: field({ type: [fourAttachmentSchema] }),
    rightAttachments: field({ type: [fourAttachmentSchema] }),
    backAttachments: field({ type: [fourAttachmentSchema] }),
    floorAttachments: field({ type: [floorAttachmentSchema] }),
    transformationAttachments: field({
      type: [transformationAttachmentSchema]
    }),

    meterWarranty: field({
      type: Date,
      optional: true,
      label: 'Тоолуурын баталгаа'
    }),

    liftHeight: field({
      type: Number,
      optional: true,
      label: 'Өргөлтийн өндөр'
    }),

    height: field({
      type: Number,
      optional: true,
      label: 'Ачилтын өндөр'
    }),

    weight: field({ type: Number, optional: true, label: 'Жин' }),

    wagonLength: field({
      type: Number,
      optional: true,
      label: 'Тэвш Урт /см/'
    }),
    wagonWidth: field({
      type: Number,
      optional: true,
      label: 'Тэвш Өргөн /см/'
    }),

    porchekHeight: field({
      type: Number,
      optional: true,
      label: 'Порчекны өндөр'
    }),
    runningValue: field({
      type: Number,
      optional: true,
      label: 'Гүйлтийн төрөл'
    }),
    volume: field({ type: Number, optional: true, label: 'Эзлэхүүн /м3/' }),
    capacityL: field({ type: Number, label: 'Багтаамж /л/' }),
    barrel1: field({ type: Number, optional: true, label: 'Торх #1' }),
    barrel2: field({ type: Number, optional: true, label: 'Торх #2' }),
    barrel3: field({ type: Number, optional: true, label: 'Торх #3' }),
    barrel4: field({ type: Number, optional: true, label: 'Торх #4' }),
    barrel5: field({ type: Number, optional: true, label: 'Торх #5' }),
    barrel6: field({ type: Number, optional: true, label: 'Торх #6' }),
    barrel7: field({ type: Number, optional: true, label: 'Торх #7' }),
    barrel8: field({ type: Number, optional: true, label: 'Торх #8' }),
    forceCapacityValue: field({
      type: Number,
      optional: true,
      label: 'Даац багтаамж'
    }),
    forceValue: field({ type: Number, optional: true, label: 'Зүтгэх хүч' })
  }),
  'erxes_carSchema'
);
