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
    addText: 'Add an experiment',
    addSuccessText: 'You successfully added an experiment',
    updateSuccessText: 'You successfully updated an experiment',
    deleteSuccessText: 'You successfully deleted an experiment',
    copySuccessText: 'You successfully copied an experiment',
    changeSuccessText: 'You successfully changed an experiment'
  },
  isMove: false,
  getExtraParams: (queryParams: any) => {
    const { priority, hackStage } = queryParams;
    const extraParams: any = {};

    if (priority) {
      extraParams.priority = priority;
    }

    if (hackStage) {
      extraParams.hackStage = hackStage;
    }

    return extraParams;
  }
};

export default options;
