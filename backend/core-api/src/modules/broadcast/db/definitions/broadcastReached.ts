import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

// Apart from the manifest because the two outlive each other differently: a
// run's rows stop mattering within weeks, "has this person been enrolled" has
// to last as long as the campaign. One row per person, so it grows with the
// audience rather than with time.
export const broadcastReachedSchema = new Schema({
  _id: mongooseStringRandomId,

  engageMessageId: { type: String, label: 'Campaign' },
  customerId: { type: String, label: 'Customer' },
  firstReachedAt: { type: Date, default: Date.now, label: 'First reached at' },
});

// The only question asked here, and the guarantee of one row per person.
broadcastReachedSchema.index(
  { engageMessageId: 1, customerId: 1 },
  { unique: true },
);
