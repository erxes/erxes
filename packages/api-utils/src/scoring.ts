export const updateUserScore = async (models, _id: string, amount: number) => {
  await models.Users.updateOne({ _id }, { $inc: { score: amount } });
};

export const getScoringConfig = async (
  models,
  action: string,
  earnOrSpend: 'earn' | 'spend'
) => {
  const exm = await models.Exms.findOne();

  if (!exm) {
    return null;
  }

  const scoringConfig = (exm.scoringConfig || []).find(
    (config) => config.action === action && config.earnOrSpend === earnOrSpend
  );

  return scoringConfig;
};
