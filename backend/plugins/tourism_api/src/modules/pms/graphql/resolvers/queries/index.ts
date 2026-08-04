import Cleaning from './cleaning';
import Configs from './configs';
import Branch from './branch';
import cpPms from './cpBranch';
export default {
  ...Cleaning,
  ...Configs,
  ...Branch,
  ...cpPms,
};
