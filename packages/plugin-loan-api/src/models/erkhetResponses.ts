export class ErkhetResponse {
  /**
   *
   * Get ErkhetResponse
   */

  public static async getErkhetResponse(models, selector: any) {
    const insuranceType = await models.ErkhetResponses.findOne(selector);

    if (!insuranceType) {
      throw new Error('ErkhetResponse not found');
    }

    return insuranceType;
  }

  /**
   * Create a insuranceType
   */
  public static async createErkhetResponse(models, doc) {
    return models.ErkhetResponses.create(doc);
  }

  /**
   * Update ErkhetResponse
   */
  public static async updateErkhetResponse(models, _id, doc) {
    await models.ErkhetResponses.updateOne({ _id }, { $set: doc });

    return models.ErkhetResponses.findOne({ _id });
  }

  /**
   * Remove ErkhetResponse
   */
  public static async removeErkhetResponses(models, _ids) {
    // await models.ErkhetResponses.getErkhetResponseCatogery(models, { _id });
    // TODO: check collateralsData
    return models.ErkhetResponses.deleteMany({ _id: { $in: _ids } });
  }

}