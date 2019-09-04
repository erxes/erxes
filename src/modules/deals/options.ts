import { toArray } from 'modules/boards/utils';
import DealEditForm from './components/DealEditForm';
import DealItem from './components/DealItem';
import PortableDeal from './components/PortableDeal';
import { mutations, queries } from './graphql';

const options = {
  EditForm: DealEditForm,
  PortableItem: PortableDeal,
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
    watchMutation: 'dealsWatch'
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
    watchMutation: mutations.dealsWatch
  },
  texts: {
    addText: 'Add a deal',
    addSuccessText: 'You successfully added a deal',
    updateSuccessText: 'You successfully updated a deal',
    deleteSuccessText: 'You successfully deleted a deal',
    changeSuccessText: 'You successfully changed a deal',
    copySuccessText: 'You successfully copied a deal'
  },
  getExtraParams: (queryParams: any) => {
    const extraParams: any = {};

    const productIds = queryParams.productIds;

    if (productIds) {
      extraParams.productIds = toArray(productIds);
    }

    return extraParams;
  }
};

export default options;
