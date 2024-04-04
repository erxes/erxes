import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IPost } from '../../db/models/post';

const ForumQuizChoice: IObjectTypeResolver<IPost, IContext> = {
  __resolveReference({ _id }, { models: { QuizChoice } }: IContext) {
    return QuizChoice.findById({ _id });
  }
};

export default ForumQuizChoice;
