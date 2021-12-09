export const loyaltyConfigSchema = {
  _id: { pkey: true },
  code: { type: String, unique: true },
  value: { type: Object }
};

export class LoyaltyConfig {
  /*
   * Get a Config
   */
  public static async getConfig(models, code: string) {
    const config = await models.LoyaltyConfigs.findOne({ code });

    if (!config) {
      throw new Error('Config not found');
    }

    return config;
  }

  /**
   * Create or update config
   */
  public static async createOrUpdateLoyaltyConfig(models, {
    code,
    value
  }: {
    code: string;
    value: any;
  }) {
    const obj = await models.LoyaltyConfigs.findOne({ code });

    if (obj) {
      await models.LoyaltyConfigs.updateOne({ _id: obj._id }, { $set: { value } });

      return models.LoyaltyConfigs.findOne({ _id: obj._id });
    }

    return models.LoyaltyConfigs.create({ code, value });
  }
}
