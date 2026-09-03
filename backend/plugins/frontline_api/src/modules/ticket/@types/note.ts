import { Model, Document } from 'mongoose';

export const NOTE_TYPES = ['note', 'comment'] as const;

/**
 * `note` is an internal, team-only note. `comment` is a message in the thread
 * the ticket requester sees and answers in the client portal.
 */
export type TNoteType = (typeof NOTE_TYPES)[number];

export interface INote {
  content: string;
  contentId: string;
  createdBy: string;
  mentions?: string[];
  statusId?: string;
  type?: TNoteType;
}

export interface INoteDocument extends INote, Document {
  _id: string;
  type: TNoteType;
  createdAt: Date;
  updatedAt: Date;
}

export type INoteModel = Model<INoteDocument>;
