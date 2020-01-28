import { toArray } from 'modules/boards/utils';
import DealEditForm from './components/DealEditForm';
import DealItem from './components/DealItem';
import { mutations, queries } from './graphql';

const options = {
  EditForm: DealEditForm,
  Item: DealItem,
  type: 'deal',
  title: 'Deal',
  queriesName: {
    itemsQuery: 'deals',
    detailQuery: 'dealDetail'
  },
  mutationsName: {
    addMutation: 'dealsAdd',
    editMutation: 'dealsEdit',
    removeMutation: 'dealsRemove',
    changeMutation: 'dealsChange',
    updateOrderMutation: 'dealsUpdateOrder',
    watchMutation: 'dealsWatch',
    copyMutation: 'dealsCopy'
  },
  queries: {
    itemsQuery: queries.deals,
    detailQuery: queries.dealDetail
  },
  mutations: {
    addMutation: mutations.dealsAdd,
    editMutation: mutations.dealsEdit,
    removeMutation: mutations.dealsRemove,
    changeMutation: mutations.dealsChange,
    updateOrderMutation: mutations.dealsUpdateOrder,
    watchMutation: mutations.dealsWatch,
    copyMutation: mutations.dealsCopy
  },
  texts: {
    addText: 'Add a deal',
    updateSuccessText: 'You successfully updated a deal',
    deleteSuccessText: 'You successfully deleted a deal',
    changeSuccessText: 'You successfully changed a deal',
    copySuccessText: 'You successfully copied a deal'
  },
  isMove: true,
  getExtraParams: (queryParams: any) => {
    const { priority, productIds } = queryParams;
    const extraParams: any = {};

    if (priority) {
      extraParams.priority = toArray(priority);
    }

    if (productIds) {
      extraParams.productIds = toArray(productIds);
    }

    return extraParams;
  }
};

export default options;
