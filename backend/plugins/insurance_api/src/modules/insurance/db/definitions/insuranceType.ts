import { Schema } from 'mongoose';

const AttributeDefinitionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    dataType: {
      type: String,
      enum: ['string', 'number', 'date', 'boolean', 'array', 'object'],
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
    options: [
      {
        // For enum-like restrictions if dataType is 'string'
        type: String,
      },
    ],
    min: {
      // For number/date validation
      type: Number,
    },
    max: {
      type: Number,
    },
  },
  { _id: false },
);

// Add recursive subAttributes after definition
AttributeDefinitionSchema.add({
  subAttributes: [AttributeDefinitionSchema],
});

export const insuranceTypeSchema = 
  new Schema(
    {
      name: { type: String, required: true },
      code: { type: String, required: true, unique: true },
      attributes: [AttributeDefinitionSchema],
    },
    { timestamps: true },
  
);



