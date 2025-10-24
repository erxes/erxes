import { checkPermission } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { IScoreLog } from '~/modules/loyalty/@types/scoreLog';

const ScoreLogMutations = {
  async changeScore(__root, doc: IScoreLog, { models }: IContext) {
    return models.ScoreLogs.changeScore(doc);
  },
};

checkPermission(ScoreLogMutations, 'changeScore', 'adjustLoyaltyScore');

export default ScoreLogMutations;
