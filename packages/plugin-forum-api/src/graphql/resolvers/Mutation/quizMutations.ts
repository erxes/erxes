import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const quizMutations: IObjectTypeResolver<any, IContext> = {
  async forumQuizCreate(_, args, { models: { Quiz } }) {
    return Quiz.createQuiz(args);
  },
  async forumQuizPatch(_, { _id, ...patch }, { models: { Quiz } }) {
    return Quiz.patchQuiz(_id, patch);
  },
  async forumQuizDelete(_, { _id }, { models: { Quiz } }) {
    return Quiz.deleteQuiz(_id);
  },
  async forumQuizQuestionCreate(_, args, { models: { QuizQuestion } }) {
    return QuizQuestion.createQuestion(args);
  },
  async forumQuizQuestionPatch(_, { _id, ...patch }, { models: { QuizQuestion } }) {
    return QuizQuestion.patchQuestion(_id, patch);
  },
  async forumQuizChoiceCreate(_, args, { models: { QuizChoice } }) {
    return QuizChoice.createChoice(args);
  },
  async forumQuizChoicePatch(_, { _id, ...patch }, { models: { QuizChoice } }) {
    return QuizChoice.patchChoice(_id, patch);
  },
  async forumQuizChoiceDelete(_, { _id }, { models: { QuizChoice } }) {
    return QuizChoice.deleteChoice(_id);
  },
  async forumQuizQuestionDelete(_, { _id }, { models: { QuizQuestion } }) {
    return QuizQuestion.deleteQuestion(_id);
  },
  async forumQuizSetState(_, { _id, state }, { models: { Quiz } }) {
    await Quiz.updateOne({ _id }, { $set: { state } });
    return true;
  }
};

moduleRequireLogin(quizMutations);

export default quizMutations;
