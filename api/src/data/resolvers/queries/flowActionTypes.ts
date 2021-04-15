import { FlowActionTypes } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IListArgs {
  page?: number;
  perPage?: number;
  searchValue?: string;
}

const queryBuilder = (params: IListArgs, flowActionTypeIdSelector: any) => {
  const selector: any = { ...flowActionTypeIdSelector };

  const { searchValue } = params;

  if (searchValue) {
    selector.name = new RegExp(`.*${params.searchValue}.*`, 'i');
  }

  return selector;
};

const flowActionTypeQueries = {
  /**
   * FlowActionTypes list
   */
  flowActionTypes(_root, args: IListArgs, { flowActionTypeIdSelector }: IContext) {
    const selector = queryBuilder(args, flowActionTypeIdSelector);

    return FlowActionTypes.find(selector).sort({ createdAt: -1 });
  },

  /**
   * Get one flowActionType
   */
  flowActionTypeDetail(_root, { _id }: { _id: string }) {
    return FlowActionTypes.findOne({ _id });
  },

  /**
   * Get all flowActionTypes count. We will use it in pager
   */
  flowActionTypesTotalCount(_root, _args, { flowActionTypeIdSelector }: IContext) {
    return FlowActionTypes.find(flowActionTypeIdSelector).countDocuments();
  },

  /**
   * Get last flowActionType
   */
  flowActionTypesGetLast() {
    return FlowActionTypes.findOne({}).sort({ createdAt: -1 });
  },
};

requireLogin(flowActionTypeQueries, 'flowActionTypesTotalCount');
requireLogin(flowActionTypeQueries, 'flowActionTypesGetLast');
requireLogin(flowActionTypeQueries, 'flowActionTypeDetail');

checkPermission(flowActionTypeQueries, 'flowActionTypes', 'showFlowActionTypes', []);

export default flowActionTypeQueries;
