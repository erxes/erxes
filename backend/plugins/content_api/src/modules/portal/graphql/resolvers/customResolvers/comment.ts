import { IContext } from '~/connectionResolvers';
import { ICommentDocument } from '@/portal/@types/comment';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Comments.findOne({ _id });
  },

  async createdUser(
    comment: ICommentDocument,
    _args,
    {  models }: IContext
  ) {
    if (comment.userType === 'team') {
      const user = await sendTRPCMessage({
        pluginName: 'core',
        method: 'query',
        module: 'core',
        action: 'users.findOne',
        input: { _id: comment.userId },
      });

      if (!user) {
        return null;
      }

      const { details = {} } = user;

      return {
        _id: user._id,
        avatar: details.avatar,
        firstName: details.firstName,
        lastName: details.lastName,
        fullName: details.fullName,
        email: user.email
      };
    }

    const cpUser: any = await models.Users.getUser({
      _id: comment.userId
    });

    return {
      _id: cpUser._id,
      avatar: cpUser.avatar,
      fullName: `${cpUser.firstName} ${cpUser.lastName}`,
      firstName: cpUser.firstName,
      lastName: cpUser.lastName,
      email: cpUser.email
    };
  }
};
