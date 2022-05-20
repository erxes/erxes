import Users from '../../../models/Users';
import { IContext } from '../../types';

const userQueries = {
  userDetail(_root, { _id }: { _id: string }) {
    return Users.findOne({ _id });
  },

  currentUser(_root, _args, { user }: IContext) {
    return user ? Users.findOne({ _id: user._id }) : null;
  }
};

export default userQueries;
