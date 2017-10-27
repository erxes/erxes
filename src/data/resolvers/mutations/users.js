import auth from '../../../auth';

export default {
  login(root, args) {
    return auth.login(args);
  },

  forgotPassword(root, args) {
    return auth.forgotPassword(args);
  },

  resetPassword(root, args) {
    return auth.resetPassword(args);
  },
};
