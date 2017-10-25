import mongoose from 'mongoose';
import Random from 'meteor-random';

const UserSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  username: String,
  password: String,
  details: Object,
  email: String,
});

const Users = mongoose.model('users', UserSchema);

export default Users;
