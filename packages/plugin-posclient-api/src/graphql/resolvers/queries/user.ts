import Users from '../../../models/Users';
import { IContext } from '../../types';

const userQueries = {
  userDetail(_root, models, { _id }: { _id: string }) {
    return models.Users.findOne({ _id });
  },

  currentUser(_root, models, _args, { user }: IContext) {
    return user ? models.Users.findOne({ _id: user._id }) : null;
  }
};

export default userQueries;
