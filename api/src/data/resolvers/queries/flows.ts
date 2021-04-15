import { Flows } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IListArgs {
  page?: number;
  perPage?: number;
  searchValue?: string;
}

const queryBuilder = (params: IListArgs, flowIdSelector: any) => {
  const selector: any = { ...flowIdSelector };

  const { searchValue } = params;

  if (searchValue) {
    selector.name = new RegExp(`.*${params.searchValue}.*`, 'i');
  }

  return selector;
};

const flowQueries = {
  /**
   * Flows list
   */
  flows(_root, args: IListArgs, { flowIdSelector }: IContext) {
    const selector = queryBuilder(args, flowIdSelector);

    return Flows.find(selector).sort({ createdAt: -1 });
  },

  /**
   * Get one flow
   */
  flowDetail(_root, { _id }: { _id: string }) {
    return Flows.findOne({ _id });
  },

  /**
   * Get all flows count. We will use it in pager
   */
  flowsTotalCount(_root, _args, { flowIdSelector }: IContext) {
    return Flows.find(flowIdSelector).countDocuments();
  },

  /**
   * Get last flow
   */
  flowsGetLast() {
    return Flows.findOne({}).sort({ createdAt: -1 });
  },
};

requireLogin(flowQueries, 'flowsTotalCount');
requireLogin(flowQueries, 'flowsGetLast');
requireLogin(flowQueries, 'flowDetail');

checkPermission(flowQueries, 'flows', 'showFlows', []);

export default flowQueries;
