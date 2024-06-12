import { IContext } from '../../connectionResolver';
import { IInvestmentDocument } from '../../models/definitions/investments';

export default {
  async package(investment: IInvestmentDocument, _args, { models }: IContext) {
    return models.Packages.findOne({ _id: investment.packageId });
  }
};
