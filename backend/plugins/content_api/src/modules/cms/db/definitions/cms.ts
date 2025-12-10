import mongoose from 'mongoose';

import { IContentCMSDocument } from '@/cms/@types/cms';

export const cmsSchema = new mongoose.Schema<IContentCMSDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    clientPortalId: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    language: { type: String, optional: true },
    languages: { type: [String], optional: true },
  },
  { timestamps: true },
);
