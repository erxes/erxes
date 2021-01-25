import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IClientPortal {
  name: string;
  description?: string;
  logo?: string;
  icon?: string;
  knowledgeBaseLabel?: string;
  ticketLabel?: string;
  taskLabel?: string;
  taskStageId?: string;
  taskPipelineId?: string;
  taskBoardId?: string;
  ticketStageId?: string;
  ticketPipelineId?: string;
  ticketBoardId?: string;
}

export interface IClientPortalDocument extends IClientPortal, Document {
  _id: string;
}

export const clientPortalSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  description: field({ type: String }),
  logo: field({ type: String }),
  icon: field({ type: String }),
  knowledgeBaseLabel: field({ type: String }),
  ticketLabel: field({ type: String }),
  taskLabel: field({ type: String }),
  taskStageId: field({ type: String }),
  taskPipelineId: field({ type: String }),
  taskBoardId: field({ type: String }),
  ticketStageId: field({ type: String }),
  ticketPipelineId: field({ type: String }),
  ticketBoardId: field({ type: String })
});
