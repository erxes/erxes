import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { IPost } from '../../db/models/post';
import { Quiz } from '../../db/models/quiz';

const ForumQuiz: IObjectTypeResolver<Quiz, IContext> = {
  async __resolveReference({ _id }, { models: { Quiz } }: IContext) {
    return Quiz.findById({ _id });
  },
  async questions({ _id }, _, { models: { QuizQuestion } }) {
    return QuizQuestion.find({ quizId: _id }).sort({ listOrder: 1 });
  },
  async company({ companyId }) {
    if (!companyId) return null;
    return { __typename: 'Company', _id: companyId };
  },
  async tags({ tagIds }) {
    if (!tagIds) return null;
    return tagIds.map(tagId => ({ __typename: 'Tag', _id: tagId }));
  },
  async category({ categoryId }, _, { models: { Category } }) {
    if (!categoryId) return null;
    return Category.findById(categoryId);
  },
  async post({ postId }, _, { dataLoaders: { post } }) {
    if (!postId) return null;
    return post.load(postId);
  }
};

export default ForumQuiz;
