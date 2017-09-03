import mongoose from 'mongoose';
import Random from 'meteor-random';

const UserSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  avatar: String,
  fullName: String,
  position: String,
  username: String,
  twitterUsername: String,
  email: String,
  role: String,
  channelIds: [String],
  signatures: [Object],
});

const Users = mongoose.model('users', UserSchema);

export default Users;
