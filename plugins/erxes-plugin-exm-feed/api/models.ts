import {
  commentSchema,
  emojiSchema,
  feedSchema,
  thankSchema
} from './definitions';
import { EmojiDoc } from './resolvers/mutations/exmFeedEmoji';

class Feed {
  public static async getExmFeed(models, _id: string) {
    const exm = await models.ExmFeed.findOne({ _id });

    if (!exm) {
      throw new Error('Feed not found');
    }

    return exm;
  }

  public static async removeFeeds(models, ids: string[]) {
    await models.ExmFeed.deleteMany({ _id: { $in: ids } });
  }

  /*
   * Create new exm
   */
  public static async createExmFeed(models, doc: any, user: any) {
    const exm = await models.ExmFeed.create({
      createdBy: user._id,
      createdAt: doc.createdAt || new Date(),
      ...doc
    });

    return exm;
  }

  /*
   * Update exm
   */
  public static async updateExmFeed(models, _id: string, doc: any, user: any) {
    await models.ExmFeed.updateOne(
      { _id },
      {
        $set: {
          updatedBy: user._id,
          updatedAt: new Date(),
          ...doc
        }
      }
    );

    return models.ExmFeed.findOne({ _id });
  }

  /*
   * Remove exm
   */
  public static async removeExmFeed(models, _id: string) {
    const exmObj = await models.ExmFeed.findOne({ _id });

    if (!exmObj) {
      throw new Error(`Feed not found with id ${_id}`);
    }

    return exmObj.remove();
  }
}

class ExmFeedComment {
  /*
   * Create new comment
   */
  public static async createComment(models, doc: any, user: any) {
    const comment = await models.ExmFeedComments.create({
      createdBy: user._id,
      createdAt: new Date(),
      ...doc
    });

    return comment;
  }

  /*
   * Update exm
   */
  public static async updateComment(models, _id: string, doc: any, user: any) {
    await models.ExmFeedComments.updateOne(
      { _id },
      {
        $set: {
          updatedBy: user._id,
          updatedAt: new Date(),
          ...doc
        }
      }
    );

    return models.ExmFeedComments.findOne({ _id });
  }

  /*
   * Remove exm
   */
  public static async removeComment(models, _id: string) {
    const exmObj = await models.ExmFeedComments.findOne({ _id });

    if (!exmObj) {
      throw new Error(`Comment not found with id ${_id}`);
    }

    return exmObj.remove();
  }
}

class ExmFeedEmoji {
  /*
   * Create new emoji
   */
  public static async createEmoji(models, doc: EmojiDoc) {
    return models.ExmFeedEmojis.create({
      createdAt: new Date(),
      ...doc
    });
  }

  /*
   * Remove exm
   */
  public static async removeEmoji(models, doc: EmojiDoc) {
    return models.ExmFeedEmojis.deleteOne(doc);
  }
}

class ExmThank {
  public static async getThank(models, _id: string) {
    const thank = await models.ExmThanks.findOne({ _id });

    if (!thank) {
      throw new Error('Thank you not found');
    }

    return thank;
  }

  /*
   * Create new thank
   */
  public static async createThank(models, doc: any, user: any) {
    const thank = await models.ExmThanks.create({
      createdBy: user._id,
      createdAt: new Date(),
      ...doc
    });

    return thank;
  }

  /*
   * Update thank
   */
  public static async updateThank(models, _id: string, doc: any, user: any) {
    await models.ExmThanks.updateOne(
      { _id },
      {
        $set: {
          updatedBy: user._id,
          updatedAt: new Date(),
          ...doc
        }
      }
    );

    return models.ExmThanks.findOne({ _id });
  }

  /*
   * Remove thank
   */
  public static async removeThank(models, _id: string) {
    const thankObj = await models.ExmThanks.findOne({ _id });

    if (!thankObj) {
      throw new Error(`Thank you not found with id ${_id}`);
    }

    return thankObj.remove();
  }
}

export default [
  {
    name: 'ExmFeed',
    schema: feedSchema,
    klass: Feed
  },
  {
    name: 'ExmFeedComments',
    schema: commentSchema,
    klass: ExmFeedComment
  },
  {
    name: 'ExmFeedEmojis',
    schema: emojiSchema,
    klass: ExmFeedEmoji
  },
  {
    name: 'ExmThanks',
    schema: thankSchema,
    klass: ExmThank
  }
];
