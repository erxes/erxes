import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
    commentSchema,
    IComment,
    ICommentDocument
} from './definitions/comments';

export interface ICommentModel extends Model<ICommentDocument> {
    getComment(typeId: string): Promise<ICommentDocument>;
    createComment(doc: IComment): Promise<ICommentDocument>;
    updateComment(_id: string, doc: IComment): Promise<ICommentDocument>;
    deleteComment(_id: string): void;
}

export const loadCommentClass = (models: IModels) => {
    class Comment {
        /**
         * Retreives comment
         */
        public static async getComment(typeId: string) {
            const comment = await models.Comments.find({ typeId });

            if (!comment) {
                throw new Error('Comment not found');
            }

            return comment;
        }

        public static async createComment(doc: ICommentDocument) {
            return models.Comments.create({
                ...doc,
                createdAt: new Date()
            });
        }

        public static async deleteComment(_id: string) {
            return models.Comments.deleteOne({ _id });
        }
    }

    commentSchema.loadClass(Comment);

    return commentSchema;
};
