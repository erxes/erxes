import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IPost } from '../../db/models/post';

const ForumQuizQuestion: IObjectTypeResolver<IPost, IContext> = {
  async __resolveReference({ _id }, { models: { QuizQuestion } }: IContext) {
    return QuizQuestion.findById({ _id });
  },
  async choices({ _id }, _, { models: { QuizChoice } }) {
    return QuizChoice.find({ questionId: _id }).sort({ listOrder: 1 });
  }
};

export default ForumQuizQuestion;
