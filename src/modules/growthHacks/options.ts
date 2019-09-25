import { toArray } from 'modules/boards/utils';
import PortableGrowthHack from 'modules/growthHacks/components/PortableGrowthHack';
import GrowthHackEditForm from 'modules/growthHacks/containers/GrowthHackEditForm';
import GrowthHackItem from './components/GrowthHackItem';
import { mutations, queries } from './graphql';

const options = {
  EditForm: GrowthHackEditForm,
  PortableItem: PortableGrowthHack,
  Item: GrowthHackItem,
  type: 'growthHack',
  title: 'Growth hack',
  queriesName: {
    itemsQuery: 'growthHacks',
    detailQuery: 'growthHackDetail'
  },
  mutationsName: {
    addMutation: 'growthHacksAdd',
    editMutation: 'growthHacksEdit',
    removeMutation: 'growthHacksRemove',
    changeMutation: 'growthHacksChange',
    updateOrderMutation: 'growthHacksUpdateOrder',
    watchMutation: 'growthHacksWatch'
  },
  queries: {
    itemsQuery: queries.growthHacks,
    detailQuery: queries.growthHackDetail
  },
  mutations: {
    addMutation: mutations.growthHacksAdd,
    editMutation: mutations.growthHacksEdit,
    removeMutation: mutations.growthHacksRemove,
    changeMutation: mutations.growthHacksChange,
    updateOrderMutation: mutations.growthHacksUpdateOrder,
    watchMutation: mutations.growthHacksWatch
  },
  texts: {
    addText: 'Add an experiments',
    addSuccessText: 'You successfully added an experiments',
    updateSuccessText: 'You successfully updated an experiments',
    deleteSuccessText: 'You successfully deleted an experiments',
    copySuccessText: 'You successfully copied an experiments',
    changeSuccessText: 'You successfully changed a experiments'
  },
  isMove: false,
  getExtraParams: (queryParams: any) => {
    const { priority } = queryParams;
    const extraParams: any = {};

    if (priority) {
      extraParams.priority = toArray(priority);
    }

    return extraParams;
  }
};

export default options;
