import { IPurposeDocument } from '../../models/definitions/loanPurpose';

const purpose = {
  isRoot(category: IPurposeDocument) {
    return category.parentId ? false : true;
  },
};

export default purpose;
