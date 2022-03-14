import { exmSchema, IExm } from './definitions';

class Exm {
  public static async getExm(models, _id: string) {
    const exm = await models.Exms.findOne({ _id });

    if (!exm) {
      throw new Error('Exm not found');
    }

    return exm;
  }

  /*
   * Create new exm
   */
  public static async createExm(models, doc: IExm, user: any) {
    const exm = await models.Exms.create({
      createdBy: user._id,
      createdAt: new Date(),
      ...doc
    });

    return exm;
  }

  /*
   * Update exm
   */
  public static async updateExm(models, _id: string, doc: IExm) {
    await models.Exms.updateOne({ _id }, { $set: doc });

    return models.Exms.findOne({ _id });
  }

  /*
   * Remove exm
   */
  public static async removeExm(models, _id: string) {
    const exmObj = await models.Exms.getExm(_id);

    return exmObj.remove();
  }

  public static async useScoringConfig(models, user, action, earnOrSpend) {
    const exmObj = await models.Exms.findOne().lean();

    const scoringConfig = (exmObj.scoringConfig || []).find(
      config => config.action === action
    ) || { score: 0 };

    const score = scoringConfig.score || 0;

    await models.Users.updateOne({ _id: user._id }, { $inc: { score } });

    return score;
  }
}

export default [
  {
    name: 'Exms',
    schema: exmSchema,
    klass: Exm
  }
];
