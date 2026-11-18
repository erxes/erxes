import { Connection, Model, Schema } from 'mongoose';
import {
  DATA_EXTENSION_FIELD_KEY_PATTERN,
  DATA_EXTENSION_FILTER_OPERATORS,
  DATA_EXTENSION_QUERY_LIMITS,
  DataExtensionValidationError,
  getDataExtensionRecordType,
  IDataExtensionFilter,
} from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const DATA_EXTENSION_VIEW_TYPES = ['table', 'kanban', 'calendar'] as const;

export type DataExtensionViewType = (typeof DATA_EXTENSION_VIEW_TYPES)[number];

export interface IDataExtensionView {
  recordType: string;
  name: string;
  type: DataExtensionViewType;
  filter?: IDataExtensionFilter;
  sortField?: string;
  sortDirection?: 1 | -1;
  /** Field keys shown as table columns, in order. */
  columns?: string[];
  /** Kanban: the select, member or relation field the columns come from. */
  groupBy?: string;
  /** Calendar: the date field records are placed by. */
  dateField?: string;
  /** Shown to everyone who can read the record type, not just its creator. */
  shared: boolean;
  createdBy: string;
}

export interface IDataExtensionViewDocument extends IDataExtensionView {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const VIEWS_COLLECTION = 'data_extensions_views';
const VIEWS_PER_RECORD_TYPE = 50;
const NATIVE_SORT_FIELDS = ['name', 'createdAt', 'updatedAt'];

const viewSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    recordType: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: DATA_EXTENSION_VIEW_TYPES },
    filter: { type: Schema.Types.Mixed },
    sortField: { type: String },
    sortDirection: { type: Number },
    columns: { type: [String], default: undefined },
    groupBy: { type: String },
    dateField: { type: String },
    shared: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

viewSchema.index({ recordType: 1, shared: 1, createdBy: 1 });

const viewsOf = (models: IModels): Model<IDataExtensionViewDocument> => {
  const connection = models.DataExtensionFields.db as Connection;

  return (
    (connection.models[VIEWS_COLLECTION] as Model<IDataExtensionViewDocument>) ||
    connection.model<IDataExtensionViewDocument>(VIEWS_COLLECTION, viewSchema)
  );
};

const fail = (message: string): never => {
  throw new DataExtensionValidationError(message);
};

const fieldKey = (value: unknown, name: string) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return typeof value === 'string' && DATA_EXTENSION_FIELD_KEY_PATTERN.test(value)
    ? value
    : fail(`${name} must be a field key`);
};

/**
 * Checks a view's shape. Field keys and operators are checked again, with
 * values, when the view is queried: definitions may change in between.
 */
const normalizeView = (
  input: Partial<IDataExtensionView>,
  existing?: IDataExtensionViewDocument,
) => {
  const view: Partial<IDataExtensionView> = {};

  if (input.name !== undefined || !existing) {
    const name = typeof input.name === 'string' ? input.name.trim() : '';

    if (!name || name.length > 80) {
      fail('A view needs a name of up to 80 characters');
    }

    view.name = name;
  }

  if (input.type !== undefined || !existing) {
    if (!(DATA_EXTENSION_VIEW_TYPES as readonly string[]).includes(input.type as string)) {
      fail('A view is a table, kanban or calendar');
    }

    view.type = input.type;
  }

  if (input.filter !== undefined) {
    const conditions = input.filter?.conditions || [];

    if (!Array.isArray(conditions) || conditions.length > DATA_EXTENSION_QUERY_LIMITS.conditions) {
      fail(`A filter has at most ${DATA_EXTENSION_QUERY_LIMITS.conditions} conditions`);
    }

    for (const condition of conditions) {
      if (
        !condition ||
        typeof condition.field !== 'string' ||
        condition.field.length > 63 ||
        !(DATA_EXTENSION_FILTER_OPERATORS as readonly string[]).includes(condition.operator)
      ) {
        fail('Each condition needs a field and a known operator');
      }

      if (JSON.stringify(condition.value ?? null).length > 2000) {
        fail('A condition value is too large');
      }
    }

    view.filter = {
      match: input.filter?.match === 'any' ? 'any' : 'all',
      conditions: conditions.map(({ field, operator, value }) => ({
        field,
        operator,
        ...(value === undefined ? {} : { value }),
      })),
    };
  }

  if (input.sortField !== undefined) {
    const sortField = input.sortField || undefined;

    if (
      sortField &&
      !NATIVE_SORT_FIELDS.includes(sortField) &&
      !/^dataExtensions\.[a-z][a-zA-Z0-9]{0,62}$/.test(sortField)
    ) {
      fail('Sort by name, a date or dataExtensions.<key>');
    }

    view.sortField = sortField;
  }

  if (input.sortDirection !== undefined) {
    view.sortDirection = input.sortDirection === 1 ? 1 : -1;
  }

  if (input.columns !== undefined) {
    const columns = input.columns || [];

    if (!Array.isArray(columns) || columns.length > 100) {
      fail('A view shows at most 100 columns');
    }

    view.columns = columns.map((column) => fieldKey(column, 'Column') as string);
  }

  if (input.groupBy !== undefined) {
    view.groupBy = fieldKey(input.groupBy, 'Group by');
  }

  if (input.dateField !== undefined) {
    view.dateField = fieldKey(input.dateField, 'Date field');
  }

  if (input.shared !== undefined) {
    view.shared = Boolean(input.shared);
  }

  return view;
};

/** The caller's own views and every shared view of a record type. */
export const listDataExtensionViews = (
  models: IModels,
  recordType: string,
  userId: string,
) =>
  viewsOf(models)
    .find({ recordType, $or: [{ shared: true }, { createdBy: userId }] })
    .sort({ shared: -1, createdAt: 1 })
    .lean<IDataExtensionViewDocument[]>();

export const addDataExtensionView = async (
  models: IModels,
  input: Partial<IDataExtensionView>,
  userId: string,
  canShare: boolean,
) => {
  const recordType = input.recordType;

  if (!recordType || !getDataExtensionRecordType(recordType)) {
    fail(`Unsupported record type "${recordType}"`);
  }

  if (input.shared && !canShare) {
    fail('Only Data Extensions managers can share views');
  }

  const Views = viewsOf(models);

  if ((await Views.countDocuments({ recordType })) >= VIEWS_PER_RECORD_TYPE) {
    fail(`A record type can have at most ${VIEWS_PER_RECORD_TYPE} views`);
  }

  const created = await Views.create({
    ...normalizeView(input),
    recordType,
    shared: Boolean(input.shared),
    createdBy: userId,
  });

  return created.toObject();
};

/** The creator edits a personal view; managers edit shared ones. */
const editableView = async (
  models: IModels,
  _id: string,
  userId: string,
  canShare: boolean,
) => {
  const view = await viewsOf(models)
    .findById(_id)
    .lean<IDataExtensionViewDocument | null>();

  if (!view) {
    return fail('View not found');
  }

  if (view.shared ? !canShare : view.createdBy !== userId) {
    fail(view.shared ? 'Only Data Extensions managers can change shared views' : 'This view belongs to someone else');
  }

  return view;
};

export const editDataExtensionView = async (
  models: IModels,
  _id: string,
  input: Partial<IDataExtensionView>,
  userId: string,
  canShare: boolean,
) => {
  const existing = await editableView(models, _id, userId, canShare);

  if (input.shared && !canShare) {
    fail('Only Data Extensions managers can share views');
  }

  return viewsOf(models)
    .findOneAndUpdate(
      { _id },
      { $set: normalizeView({ ...input, recordType: existing.recordType }, existing) },
      { new: true },
    )
    .lean<IDataExtensionViewDocument | null>();
};

export const deleteDataExtensionView = async (
  models: IModels,
  _id: string,
  userId: string,
  canShare: boolean,
) => {
  await editableView(models, _id, userId, canShare);
  await viewsOf(models).deleteOne({ _id });

  return _id;
};
