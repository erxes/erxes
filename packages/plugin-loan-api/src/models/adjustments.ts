export class Adjustment {
  /**
   *
   * Get Adjustment
   */

  public static async getAdjustment(models, selector: any) {
    const adjustment = await models.Adjustments.findOne(selector);

    if (!adjustment) {
      throw new Error('Adjustment not found');
    }

    return adjustment;
  }

  /**
   * Create a adjustment
   */
  public static async createAdjustment(models, doc) {
    return models.Adjustments.create(doc);
  }

  /**
   * Update Adjustment
   */
  public static async updateAdjustment(models, _id, doc) {
    await models.Adjustments.updateOne({ _id }, { $set: doc });

    return models.Adjustments.findOne({ _id });
  }

  /**
   * Remove Adjustment
   */
  public static async removeAdjustments(models, _ids) {
    return models.Adjustments.deleteMany({ _id: { $in: _ids } });
  }

}