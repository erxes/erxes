import { Schema } from 'mongoose';

/**
 * Mongoose storage for the segment condition tree. The node types themselves
 * are a cross-service contract and live in `erxes-api-shared`.
 */
export type {
  SegmentFieldNode,
  SegmentGroupNode,
  SegmentNode,
  SegmentRelationNode,
  SegmentValue,
} from 'erxes-api-shared/core-modules';

/**
 * One permissive sub-schema covers all three node kinds, because Mongoose has
 * no discriminated union for embedded documents. `kind` is the discriminant and
 * the API boundary validates the full shape.
 */
export const segmentNodeSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ['group', 'field', 'relation'],
      required: true,
    },

    // group
    conjunction: { type: String, enum: ['and', 'or'] },

    // field
    contentType: { type: String },
    fieldKey: { type: String },
    operator: { type: String },
    value: { type: Schema.Types.Mixed },

    // relation
    relationKey: { type: String },
    measure: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

segmentNodeSchema.add({
  children: { type: [segmentNodeSchema], default: undefined },
  child: { type: segmentNodeSchema, default: undefined },
});
