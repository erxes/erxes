import { Schema, Document } from 'mongoose';

export interface IAiEmbedding {
  fileId: string;
  fileName: string;
  fileContent: string;
  embedding: number[];
  bucket: string;
  key: string;
  embeddingModel: string;
  dimensions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAiEmbeddingDocument extends IAiEmbedding, Document {
  _id: string;
}

export const aiEmbeddingSchema = new Schema<IAiEmbeddingDocument>(
  {
    fileId: {
      type: String,
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileContent: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    bucket: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    embeddingModel: {
      type: String,
      required: true,
      default: 'bge-large-en-v1.5',
    },
    dimensions: {
      type: Number,
      required: true,
      default: 1024,
    },
  },
  {
    timestamps: true,
    collection: 'ai_embeddings',
  },
);

// Create indexes for better query performance
aiEmbeddingSchema.index({ fileId: 1 });
aiEmbeddingSchema.index({ fileName: 1 });
aiEmbeddingSchema.index({ createdAt: -1 });
aiEmbeddingSchema.index({ updatedAt: -1 });
