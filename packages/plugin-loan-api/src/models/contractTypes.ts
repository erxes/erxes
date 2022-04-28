export class ContractType {
  /**
   *
   * Get ContractType
   */

  public static async getContractType(models, selector: any) {
    const insuranceType = await models.ContractTypes.findOne(selector);

    if (!insuranceType) {
      throw new Error('ContractType not found');
    }

    return insuranceType;
  }

  /**
   * Create a insuranceType
   */
  public static async createContractType(models, doc) {
    return models.ContractTypes.create(doc);
  }

  /**
   * Update ContractType
   */
  public static async updateContractType(models, _id, doc) {
    await models.ContractTypes.updateOne({ _id }, { $set: doc });

    return models.ContractTypes.findOne({ _id });
  }

  /**
   * Remove ContractType
   */
  public static async removeContractTypes(models, _ids) {
    // await models.ContractTypes.getContractTypeCatogery(models, { _id });
    // TODO: check collateralsData
    return models.ContractTypes.deleteMany({ _id: { $in: _ids } });
  }

}