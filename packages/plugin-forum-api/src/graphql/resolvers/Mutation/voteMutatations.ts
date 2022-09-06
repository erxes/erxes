import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import {
  postUpVote,
  postDownVote,
  commentDownVote,
  commentUpVote
} from '../../../db/models/vote';

const voteMutations: IObjectTypeResolver<any, IContext> = {
  async forumUpVotePostCp(_, args, { models, cpUser }) {
    await postUpVote(models, args.postId, cpUser);
    return true;
  },
  async forumDownVotePostCp(_, args, { models, cpUser }) {
    await postDownVote(models, args.postId, cpUser);
    return true;
  },
  async forumUpVoteCommentCp(_, args, { models, cpUser }) {
    await commentUpVote(models, args.postId, cpUser);
    return true;
  },
  async forumDownVoteCommentCp(_, args, { models, cpUser }) {
    await commentDownVote(models, args.postId, cpUser);
    return true;
  }
};

export default voteMutations;
