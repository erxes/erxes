import { Schema } from 'mongoose';

export type {
  SegmentFieldNode,
  SegmentGroupNode,
  SegmentNode,
  SegmentReferenceNode,
  SegmentRelationNode,
  SegmentValue,
} from 'erxes-api-shared/core-modules';

export const segmentNodeSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ['group', 'field', 'relation', 'segment'],
      required: true,
    },

    conjunction: { type: String, enum: ['and', 'or'] },

    contentType: { type: String },
    fieldKey: { type: String },
    operator: { type: String },
    value: { type: Schema.Types.Mixed },

    relationKey: { type: String },
    measure: { type: Schema.Types.Mixed },

    segmentId: { type: String },
    exclude: { type: Boolean },
  },
  { _id: false },
);

segmentNodeSchema.add({
  children: { type: [segmentNodeSchema], default: undefined },
  child: { type: segmentNodeSchema, default: undefined },
});
