import Cleaning from './cleaning';
import Configs from './configs';
import Branch from './branch';

export default {
  ...Branch,
  ...Cleaning,
  ...Configs,
};
