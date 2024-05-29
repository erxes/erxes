import { Document, Schema, Model, Connection, Types } from 'mongoose';
import { IModels } from './index';
import * as _ from 'lodash';
import { ICpUser } from '../../graphql';
import { LoginRequiredError } from '../../customErrors';

export const QUIZ_STATES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type QuizState = typeof QUIZ_STATES[number];

export interface Quiz {
  _id: any;

  postId?: string | null;
  companyId?: string | null;
  tagIds?: string[] | null;
  categoryId?: string | null;

  name?: string | null;
  description?: string | null;

  isLocked: boolean;

  state: QuizState;
}

export type QuizDocument = Quiz & Document;

export const quizSchema = new Schema<QuizDocument>({
  postId: { type: Schema.Types.ObjectId, index: true, sparse: true },
  companyId: { type: String, index: true, sparse: true },
  tagIds: [{ type: String, index: true, sparse: true }],
  categoryId: { type: Schema.Types.ObjectId, index: true, sparse: true },
  isLocked: { type: Boolean, default: false, required: true },
  state: { type: String, enum: QUIZ_STATES, default: (): QuizState => 'DRAFT' },

  name: String,
  description: String
});

export interface QuizModel extends Model<QuizDocument> {
  findByIdOrThrow(_id: string): Promise<QuizDocument>;
  createQuiz(
    input: Omit<Quiz, '_id' | 'isLocked' | 'state'>
  ): Promise<QuizDocument>;
  patchQuiz(
    _id: string,
    patch: Partial<Omit<Quiz, '_id' | 'isLocked'>>
  ): Promise<QuizDocument>;
  deleteQuiz(_id: string): Promise<QuizDocument>;
}

const generateQuizModel = (
  subdomain: string,
  con: Connection,
  models: IModels
) => {
  class QuizStatics {
    public static async findByIdOrThrow(_id: string) {
      const quiz = await models.Quiz.findById(_id);
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      return quiz;
    }
    public static async createQuiz(
      input: Omit<Quiz, '_id' | 'isLocked'>
    ): Promise<QuizDocument> {
      return models.Quiz.create(input);
    }
    public static async patchQuiz(
      _id: string,
      patch: Partial<Omit<Quiz, '_id' | 'isLocked'>>
    ): Promise<QuizDocument> {
      const quiz = await models.Quiz.findByIdAndUpdate(
        _id,
        { $set: patch },
        { new: true }
      );
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      return quiz;
    }
    public static async deleteQuiz(_id: string): Promise<QuizDocument> {
      const quiz = await models.Quiz.findByIdOrThrow(_id);
      await models.QuizChoice.deleteMany({ quizId: _id });
      await models.QuizQuestion.deleteMany({ quizId: _id });
      return quiz.remove();
    }
  }
  quizSchema.loadClass(QuizStatics);
  models.Quiz = con.model<QuizDocument, QuizModel>('forum_quiz', quizSchema);
};

export interface QuizQuestion {
  _id: any;
  quizId: string;
  text?: string | null;
  imageUrl?: string | null;
  isMultipleChoice: boolean;
  listOrder: number;
}

export type QuizQuestionDocument = QuizQuestion & Document;

export const quizQuestionSchema = new Schema<QuizQuestionDocument>({
  quizId: { type: Schema.Types.ObjectId, index: true, required: true },
  text: String,
  imageUrl: String,
  isMultipleChoice: { type: Boolean, default: false, required: true },
  listOrder: { type: Number, default: 0, required: true }
});

export interface QuizQuestionModel extends Model<QuizQuestionDocument> {
  findByIdOrThrow(_id: string): Promise<QuizQuestionDocument>;
  createQuestion(
    input: Omit<QuizQuestion, '_id'>
  ): Promise<QuizQuestionDocument>;
  patchQuestion(
    _id: string,
    patch: Partial<Omit<QuizQuestion, '_id'>>
  ): Promise<QuizQuestionDocument>;
  deleteQuestion(_id: string): Promise<QuizQuestionDocument>;
}

const generateQuizQuestionModel = (
  subdomain: string,
  con: Connection,
  models: IModels
) => {
  class QuizQuestionStatics {
    public static async findByIdOrThrow(
      _id: string
    ): Promise<QuizQuestionDocument> {
      const doc = await models.QuizQuestion.findById(_id);
      if (!doc) {
        throw new Error(`Question with _id=${_id} not found`);
      }
      return doc;
    }
    public static async createQuestion(
      input: Omit<QuizQuestion, '_id'>
    ): Promise<QuizQuestionDocument> {
      return models.QuizQuestion.create(input);
    }
    public static async patchQuestion(
      _id: string,
      patch: Partial<Omit<QuizQuestion, '_id'>>
    ): Promise<QuizQuestionDocument> {
      const doc = await models.QuizQuestion.findByIdOrThrow(_id);
      _.merge(doc, patch);
      await doc.save();
      return doc;
    }
    public static async deleteQuestion(
      _id: string
    ): Promise<QuizQuestionDocument> {
      const doc = await models.QuizQuestion.findByIdOrThrow(_id);
      await models.QuizChoice.deleteMany({ questionId: doc._id });
      await doc.remove();
      return doc;
    }
  }
  quizQuestionSchema.loadClass(QuizQuestionStatics);
  models.QuizQuestion = con.model<QuizQuestionDocument, QuizQuestionModel>(
    'forum_quiz_question',
    quizQuestionSchema
  );
};

export interface QuizChoice {
  _id: any;
  quizId: string;
  questionId: string;
  text?: string | null;
  imageUrl?: string | null;
  isCorrect: boolean;
  listOrder: number;
}

export type QuizChoiceDocument = QuizChoice & Document;

export const quizChoiceSchema = new Schema<QuizChoiceDocument>({
  quizId: { type: Schema.Types.ObjectId, index: true, required: true },
  questionId: { type: Schema.Types.ObjectId, index: true, required: true },
  text: String,
  imageUrl: String,
  isCorrect: { type: Boolean, default: false, required: true },
  listOrder: { type: Number, default: 0, required: true }
});

export interface QuizChoiceModel extends Model<QuizChoiceDocument> {
  findByIdOrThrow(_id: string): Promise<QuizChoiceDocument>;
  createChoice(input: Omit<QuizChoice, '_id'>): Promise<QuizChoiceDocument>;
  patchChoice(
    _id: string,
    patch: Partial<Omit<QuizChoice, '_id' | 'quizId' | 'questionId'>>
  ): Promise<QuizChoiceDocument>;
  deleteChoice(_id): Promise<QuizChoiceDocument>;
}

const genereateQuizChoiceModel = (
  subdomain: string,
  con: Connection,
  models: IModels
) => {
  class QuizChoiceStatics {
    public static async findByIdOrThrow(
      _id: string
    ): Promise<QuizChoiceDocument> {
      const doc = await models.QuizChoice.findById(_id);
      if (!doc) {
        throw new Error(`Quiz choice with _id=${_id} doesn't exist`);
      }
      return doc;
    }
    public static async createChoice(
      input: Omit<QuizChoice, '_id'>
    ): Promise<QuizChoiceDocument> {
      const doc = await models.QuizChoice.create(input);
      return doc;
    }
    public static async patchChoice(
      _id: string,
      patch: Partial<Omit<QuizChoice, '_id' | 'quizId' | 'questionId'>>
    ): Promise<QuizChoiceDocument> {
      const doc = await models.QuizChoice.findByIdOrThrow(_id);
      _.merge(doc, patch);
      await doc.save();
      return doc;
    }
    public static async deleteChoice(_id): Promise<QuizChoiceDocument> {
      const doc = await models.QuizChoice.findByIdOrThrow(_id);
      await doc.remove();
      return doc;
    }
  }
  quizChoiceSchema.loadClass(QuizChoiceStatics);

  models.QuizChoice = con.model<QuizChoiceDocument, QuizChoiceModel>(
    'forum_quiz_choice',
    quizChoiceSchema
  );
};

export const generateQuizModels = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  generateQuizModel(subdomain, con, models);
  generateQuizQuestionModel(subdomain, con, models);
  genereateQuizChoiceModel(subdomain, con, models);
};
