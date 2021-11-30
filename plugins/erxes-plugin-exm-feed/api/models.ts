import { feedSchema, thankSchema } from './definitions';

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
    name: 'ExmThanks',
    schema: thankSchema,
    klass: ExmThank
  }
];
