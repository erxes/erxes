import mongoose from 'mongoose';
import Random from 'meteor-random';

const EmailSchema = mongoose.Schema({
  address: String,
  verified: Boolean,
});

const UserSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  username: String,
  details: Object,
  emails: [EmailSchema],
});

const Users = mongoose.model('users', UserSchema);

export default Users;
