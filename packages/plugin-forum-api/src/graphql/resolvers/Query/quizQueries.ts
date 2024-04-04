//forumQuizzes(sort: JSON, offset: Int, limit: Int): [ForumQuiz!]

import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { Types } from 'mongoose';

const quizQueries: IObjectTypeResolver<any, IContext> = {
  forumQuizzes(_, { sort = {}, offset = 0, limit = 0 }, { models: { Quiz } }) {
    return Quiz.find()
      .sort(sort)
      .skip(offset)
      .limit(limit);
  },
  forumQuiz(_, { _id }, { models: { Quiz } }) {
    return Quiz.findByIdOrThrow(_id);
  },
  forumQuizQuestion(_, { _id }, { models: { QuizQuestion } }) {
    return QuizQuestion.findByIdOrThrow(_id);
  }
};

const cpQuizQueries: IObjectTypeResolver<any, IContext> = {
  async forumCpPostRelatedQuizzes(
    _,
    { _id, offset = 0, limit = 0 },
    { models: { Quiz, Post } }
  ) {
    const post = await Post.findByIdOrThrow(_id);
    const $matchOr: any[] = [{ postId: Types.ObjectId(_id) }];
    if (post.tagIds?.length) {
      $matchOr.push({ tagIds: { $in: post.tagIds } });
    }
    if (post.categoryId) {
      $matchOr.push({ categoryId: Types.ObjectId(post.categoryId) });
    }

    const branches: any[] = [
      {
        case: {
          $eq: ['$postId', Types.ObjectId(_id)]
        },
        then: 3
      }
    ];

    if (post.categoryId && post.tagIds?.length) {
      branches.push({
        case: {
          $and: [
            { $eq: ['$categoryId', Types.ObjectId(post.categoryId)] },
            {
              $gt: [
                {
                  $size: {
                    $setIntersection: [post.tagIds, '$tagIds']
                  }
                },
                0
              ]
            }
          ]
        },
        then: 2
      });
    } else {
      const $or: any[] = [];

      if (post.categoryId) {
        $or.push({
          $eq: ['$categoryId', Types.ObjectId(post.categoryId)]
        });
      }

      if (post.tagIds?.length) {
        $or.push({
          $gt: [
            {
              $size: {
                $setIntersection: [[0], '$tagIds']
              }
            },
            0
          ]
        });
      }

      if ($or.length) {
        branches.push({
          case: {
            $or
          },
          then: 1
        });
      }
    }

    const aggregation: any[] = [
      {
        $match: {
          $or: $matchOr,
          state: 'PUBLISHED'
        }
      },
      {
        $addFields: {
          postRelatedScore: {
            $switch: {
              branches: branches,
              default: -1
            }
          }
        }
      },
      {
        $sort: {
          postRelatedScore: -1,
          _id: -1
        }
      },
      {
        $skip: offset
      }
    ];
    if (limit) {
      aggregation.push({
        $limit: limit
      });
    }

    const res = await Quiz.aggregate(aggregation);
    return res;
  },

  forumCpQuizzes(
    _,
    { offset = 0, limit = 0, sort = {}, ...params },
    { models: { Quiz } }
  ) {
    const query: any = {
      state: 'PUBLISHED'
    };

    for (const field of ['categoryId', 'companyId', 'postId']) {
      if (params) {
        query[field] = params[field];
      }
    }

    if (params.tagIds) {
      query.tagIds = { $in: params.tagIds };
    }

    console.log(query);

    return Quiz.find(query)
      .sort(sort)
      .skip(offset)
      .limit(limit);
  },
  async forumCpQuiz(_, { _id }, { models: { Quiz } }) {
    const quiz = await Quiz.findByIdOrThrow(_id);
    if (quiz.state == 'DRAFT') {
      throw new Error(`This quiz isn't published`);
    }
    if (quiz.state == 'ARCHIVED') {
      throw new Error(`This quiz is archived`);
    }
    return quiz;
  }
};

moduleRequireLogin(quizQueries);

export default { ...quizQueries, ...cpQuizQueries };
