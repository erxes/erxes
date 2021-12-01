import { commentSchema, emojiSchema } from './definitions';
import { EmojiDoc } from './resolvers/mutations/emojis';

class Comment {
  /*
   * Create new comment
   */
  public static async getComment(models, doc: any) {
    const commentObj = await models.Comments.findOne(doc);

    if (!commentObj) {
      throw new Error('Comment not found');
    }

    return commentObj;
  }

  /*
   * Create new comment
   */
  public static async createComment(models, doc: any, user: any) {
    const comment = await models.Comments.create({
      createdBy: user._id,
      createdAt: new Date(),
      ...doc
    });

    return comment;
  }

  /*
   * Update comment
   */
  public static async updateComment(models, _id: string, doc: any, user: any) {
    await models.Comments.updateOne(
      { _id },
      {
        $set: {
          updatedBy: user._id,
          updatedAt: new Date(),
          ...doc
        }
      }
    );

    return models.Comments.findOne({ _id });
  }

  /*
   * Remove comment
   */
  public static async removeComment(models, _id: string) {
    const commentObj = await models.Comments.getComment(models, { _id });

    return commentObj.remove();
  }
}

class Emoji {
  /*
   * Create new emoji
   */
  public static async createEmoji(models, doc: EmojiDoc) {
    return models.Emojis.create({
      createdAt: new Date(),
      ...doc
    });
  }

  /*
   * Remove exm
   */
  public static async removeEmoji(models, doc: EmojiDoc) {
    return models.Emojis.deleteOne(doc);
  }
}

export default [
  {
    name: 'Comments',
    schema: commentSchema,
    klass: Comment
  },
  {
    name: 'Emojis',
    schema: emojiSchema,
    klass: Emoji
  }
];
