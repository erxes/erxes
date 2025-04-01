import { Document, Schema } from "mongoose";
import { commonItemFieldsSchema, IItemCommonFields } from "./boards";
import { field } from "./utils";
interface IComment {
  content: string;
  createdAt: Date;
}
export interface ITicket extends IItemCommonFields {
  source?: string;
  comments?: IComment[];
}

export interface ITicketDocument extends ITicket, Document {
  _id: string;
}

// Mongoose schemas =======================
export const ticketSchema = new Schema({
  ...commonItemFieldsSchema,

  source: field({ type: String, label: "Source" })
});
