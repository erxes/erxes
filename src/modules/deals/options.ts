import { DealEditForm, PortableDeal } from './components';
import { DealItem } from './containers/';
import { mutations, queries } from './graphql';

const options = {
  EditForm: DealEditForm,
  PortableItem: PortableDeal,
  Item: DealItem,
  type: 'deal',
  title: 'Deals',
  queriesName: {
    itemsQuery: 'deals',
    detailQuery: 'dealDetail'
  },
  mutationsName: {
    addMutation: 'dealsAdd',
    editMutation: 'dealsEdit',
    removeMutation: 'dealsRemove',
    changeMutation: 'dealsChange',
    updateOrderMutation: 'dealsUpdateOrder'
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
    updateOrderMutation: mutations.dealsUpdateOrder
  },
  texts: {
    addText: 'Add a deal',
    addSuccessText: 'You successfully added a deal',
    updateSuccessText: 'You successfully updated a deal',
    deleteSuccessText: 'You successfully deleted a deal',
    copySuccessText: 'You successfully copied a deal'
  }
};

export default options;
