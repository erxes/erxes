import mongoose from 'mongoose';
import Random from 'meteor-random';

const ChannelSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  name: String,
  description: String,
  integrationIds: [String],
  memberIds: [String],
  createdAt: Date,
  userId: String,
  conversationCount: Number,
  openConversationCount: Number,
});

const Channels = mongoose.model('channels', ChannelSchema);

export default Channels;
