import { IContext } from '../../connectionResolver';
import { ITemplateDocument } from '../../models/definitions/template';

const tests = {
  currentType(test: ITemplateDocument, _args, { models }: IContext) {
    return models.Types.findOne({ _id: test.typeId });
  }
};

export default tests;
