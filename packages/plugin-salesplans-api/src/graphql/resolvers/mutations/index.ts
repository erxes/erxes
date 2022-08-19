import salesLogMutation from './salesplans';
import labelsMutation from './labels';
import timeframeMutations from './timeframes';

export default {
  ...salesLogMutation,
  ...labelsMutation,
  ...timeframeMutations
};
