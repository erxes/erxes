import { login } from '../../../auth';

export default {
  login(root, args) {
    return login(args);
  },
};
