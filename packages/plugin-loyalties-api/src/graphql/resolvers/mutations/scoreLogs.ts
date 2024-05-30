import { IContext } from '../../../connectionResolver';
import { IScoreLog } from '../../../models/definitions/scoreLog';

const ScoreLogMutations = {
  async changeScore(__root, doc: IScoreLog, { models }: IContext) {
    return models.ScoreLogs.changeScore(doc);
  }
};

export default ScoreLogMutations;
