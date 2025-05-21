import { IContext } from '../../../connectionResolver';
import { ICommentDocument } from '../../../models/definitions/comments';
import { sendCoreMessage } from '../../../messageBroker';

export default {
    async __resolveReference({ _id }, { models }: IContext) {
        return await models.Comments.findOne({ _id });
    },

    async createdUser(
        comment: ICommentDocument,
        _args,
        { subdomain, models }: IContext
    ) {
        if (comment.userType === 'team') {
            const user = await sendCoreMessage({
                subdomain,
                action: 'users.findOne',
                data: {
                    _id: comment.userId
                },
                isRPC: true
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
        } else if (comment.userType === 'client') {

            const customer = await sendCoreMessage({
                subdomain,
                action: 'customers.findOne',
                data: {
                    _id: comment.userId
                },
                isRPC: true
            });
            return customer
        }

    }
};
