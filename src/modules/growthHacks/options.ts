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
    addText: 'Add a growth hack',
    addSuccessText: 'You successfully added a growth hack',
    updateSuccessText: 'You successfully updated a growth hack',
    deleteSuccessText: 'You successfully deleted a growth hack',
    copySuccessText: 'You successfully copied a growth hack',
    changeSuccessText: 'You successfully changed a growth hack'
  },
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
