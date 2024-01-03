import { IContext } from '../../connectionResolver';
import { ExecFileOptionsWithStringEncoding } from 'child_process';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskFormSubmissions.findOne({ _id });
  },

  async user(
    formSubmissionUser: { _id: ExecFileOptionsWithStringEncoding },
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (formSubmissionUser._id &&
        dataLoaders.user.load(formSubmissionUser._id)) ||
      null
    );
  }
};
