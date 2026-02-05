import mongoose, { Schema } from 'mongoose';
import { INSURANCE_TYPES } from '@/insurance/@types/enums';

export const templateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'products',
      required: false,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'vendors',
      required: false,
    },

    // HTML content with Handlebars placeholders
    htmlContent: {
      type: String,
      required: true,
    },

    // CSS for styling
    cssContent: {
      type: String,
      default: '',
    },

    // Version control
    version: {
      type: Number,
      default: 1,
    },

    // Status
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },

    // Metadata
    createdBy: String,
    updatedBy: String,
  },
  {
    timestamps: true,
  },
);
