import { IContext } from '../../connectionResolver';
import { IInsuranceCategoryDocument } from '../../models/definitions/category';

const InsuranceCategory = {
  async lastModifiedBy(category: IInsuranceCategoryDocument, _params) {
    return (
      category.lastModifiedBy && {
        __typename: 'User',
        _id: category.lastModifiedBy
      }
    );
  },

  async risks(
    category: IInsuranceCategoryDocument,
    _params,
    { models }: IContext
  ) {
    return models.Risks.find({ _id: { $in: category.riskIds || [] } }).lean();
  }
};

export { InsuranceCategory };
