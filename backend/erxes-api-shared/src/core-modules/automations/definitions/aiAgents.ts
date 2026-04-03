import { Schema } from 'mongoose';
import { nanoid } from 'nanoid';

const aiAgentFilesSchema = new Schema(
  {
    id: { type: String },
    key: { type: String },
    name: { type: String },
    size: { type: Number },
    type: { type: String },
    uploadedAt: { type: Date },
  },
  { _id: false },
);

interface AiAgent {
  name: string;
  description: string;
  provider: string;
  prompt: string;
  instructions: string;
  files: {
    id: string;
    key: string;
    name: string;
    size: string;
    type: string;
    uploadedAt: string;
  }[];
  config: any;
}

export interface AiAgentDocument extends AiAgent {
  _id: string;
}

export const aiAgentSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => nanoid(),
    },
    name: { type: String },
    description: { type: String },
    provider: { type: String },
    prompt: { type: String },
    instructions: { type: String },
    files: { type: [aiAgentFilesSchema] },
    config: { type: Object },
  },
  { timestamps: true },
);
