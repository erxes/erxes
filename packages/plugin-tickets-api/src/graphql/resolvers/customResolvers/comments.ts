import { IContext } from '../../../connectionResolver';
import { ICommentDocument } from '../../../models/definitions/comments';
import { sendCoreMessage } from '../../../messageBroker';

export default {
    async __resolveReference({ _id }, { models }: IContext) {
        return await models.Comments.findOne({ _id });

    },
};
