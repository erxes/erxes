import { FlowActions } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IListArgs {
  page?: number;
  perPage?: number;
  searchValue?: string;
}

const queryBuilder = (params: IListArgs, flowActionIdSelector: any) => {
  const selector: any = { ...flowActionIdSelector };

  const { searchValue } = params;

  if (searchValue) {
    selector.name = new RegExp(`.*${params.searchValue}.*`, 'i');
  }

  return selector;
};

const flowActionQueries = {
  /**
   * FlowActions list
   */
  flowActions(_root, args: IListArgs, { flowActionIdSelector }: IContext) {
    const selector = queryBuilder(args, flowActionIdSelector);

    return FlowActions.find(selector).sort({ createdAt: -1 });
  },

  /**
   * Get one flowAction
   */
  flowActionDetail(_root, { _id }: { _id: string }) {
    return FlowActions.findOne({ _id });
  },

  /**
   * Get all flowActions count. We will use it in pager
   */
  flowActionsTotalCount(_root, _args, { flowActionIdSelector }: IContext) {
    return FlowActions.find(flowActionIdSelector).countDocuments();
  },

  /**
   * Get last flowAction
   */
  flowActionsGetLast() {
    return FlowActions.findOne({}).sort({ createdAt: -1 });
  },
};

requireLogin(flowActionQueries, 'flowActionsTotalCount');
requireLogin(flowActionQueries, 'flowActionsGetLast');
requireLogin(flowActionQueries, 'flowActionDetail');

checkPermission(flowActionQueries, 'flowActions', 'showFlowActions', []);

export default flowActionQueries;
