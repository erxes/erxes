export class Schedule {
  /**
   *
   * Get Schedule Cagegory
   */

  public static async getSchedule(models, selector: any) {
    const schedule = await models.RepaymentSchedules.findOne(selector);

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    return schedule;
  }

  /**
   * Create a schedule
   */
  public static async createSchedule(models, doc) {
    return models.RepaymentSchedules.create(doc);
  }

  /**
   * Update Schedule
   */
  public static async updateSchedule(models, _id, doc) {
    await models.RepaymentSchedules.updateOne({ _id }, { $set: doc });

    return models.RepaymentSchedules.findOne({ _id });
  }

  /**
   * Remove Schedule
   */
  public static async removeSchedule(models, _id) {
    await models.RepaymentSchedules.getScheduleCatogery(models, { _id });

    return models.RepaymentSchedules.deleteOne({ _id });
  }
}