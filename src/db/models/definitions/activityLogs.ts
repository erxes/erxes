import { Document, Schema } from 'mongoose';
import { field } from '../utils';
import { ACTIVITY_ACTIONS, ACTIVITY_PERFORMER_TYPES, ACTIVITY_TYPES, COC_CONTENT_TYPES } from './constants';

export interface IActionPerformer {
  type: string;
  id: string;
}

interface IActionPerformerDocument extends IActionPerformer, Document {
  id: string;
}

export interface IActivity {
  type: string;
  action: string;
  content?: string;
  id?: string;
}

interface IActivityDocument extends IActivity, Document {
  id?: string;
}

export interface ICoc {
  id: string;
  type: string;
}

interface ICocDocument extends ICoc, Document {
  id: string;
}

export interface IActivityLogDocument extends Document {
  _id: string;
  activity: IActivityDocument;
  performedBy?: IActionPerformerDocument;
  coc: ICocDocument;
  createdAt: Date;
}

// Mongoose schemas ===========

/* Performer of the action:
   *system* cron job, user
   ex: Sales manager that has registered a new customer
   Sales manager is the action performer */
const actionPerformerSchema = new Schema(
  {
    type: field({
      type: String,
      enum: ACTIVITY_PERFORMER_TYPES.ALL,
      default: ACTIVITY_PERFORMER_TYPES.SYSTEM,
      required: true,
    }),
    id: field({
      type: String,
    }),
  },
  { _id: false },
);

/*
   The action that is being performed
   ex1: A user writes an internal note
   in this case: type is InternalNote
                 action is create (write)
                 id is the InternalNote id
   ex2: Sales manager registers a new customer
   in this case: type is customer
                 action is create (register)
                 id is Customer id
   customer and activity contentTypes are the same in this case
   ex3: Cronjob runs and a customer is found to be suitable for a particular segment
                 action is create: a new segment user
                 type is segment
                 id is Segment id
   ex4: An internalNote concerning a customer was updated
                 action is update
                 type is InternalNote
                 id is InternalNote id
 */
const activitySchema = new Schema(
  {
    type: field({
      type: String,
      required: true,
      enum: ACTIVITY_TYPES.ALL,
    }),
    action: field({
      type: String,
      required: true,
      enum: ACTIVITY_ACTIONS.ALL,
    }),
    content: field({
      type: String,
      optional: true,
    }),
    id: field({
      type: String,
    }),
  },
  { _id: false },
);

/* the customer that is related to a given ActivityLog
 can be both Company or Customer documents */
const cocSchema = new Schema(
  {
    id: field({
      type: String,
      required: true,
    }),
    type: field({
      type: String,
      enum: COC_CONTENT_TYPES.ALL,
      required: true,
    }),
  },
  { _id: false },
);

export const activityLogSchema = new Schema({
  _id: field({ pkey: true }),
  activity: { type: activitySchema },
  performedBy: { type: actionPerformerSchema, optional: true },
  coc: { type: cocSchema },

  createdAt: field({
    type: Date,
    required: true,
    default: Date.now,
  }),
});
