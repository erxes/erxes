import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { IScoreLog } from '../../../models/definitions/scoreLog';

const ScoreLogMutations = {
  async changeScore(__root, doc: IScoreLog, { models }: IContext) {
    return models.ScoreLogs.changeScore(doc);
  }
};

checkPermission(ScoreLogMutations, 'changeScore', 'adjustLoyaltyScore');

export default ScoreLogMutations;
