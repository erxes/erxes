import auth from '../../../auth';

export default {
  login(root, args) {
    return auth.login(args);
  },
};
