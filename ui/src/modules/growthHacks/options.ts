import GrowthHackEditForm from 'modules/growthHacks/containers/GrowthHackEditForm';
import GrowthHackItem from './components/GrowthHackItem';
import { mutations, queries } from './graphql';

const options = {
  EditForm: GrowthHackEditForm,
  Item: GrowthHackItem,
  type: 'growthHack',
  title: 'Growth hacking',
  queriesName: {
    itemsQuery: 'growthHacks',
    detailQuery: 'growthHackDetail',
    archivedItemsQuery: 'archivedGrowthHacks',
    archivedItemsCountQuery: 'archivedGrowthHacksCount'
  },
  mutationsName: {
    addMutation: 'growthHacksAdd',
    editMutation: 'growthHacksEdit',
    removeMutation: 'growthHacksRemove',
    changeMutation: 'growthHacksChange',
    watchMutation: 'growthHacksWatch',
    archiveMutation: 'growthHacksArchive',
    copyMutation: 'growthHacksCopy'
  },
  queries: {
    itemsQuery: queries.growthHacks,
    detailQuery: queries.growthHackDetail,
    archivedItemsQuery: queries.archivedGrowthHacks,
    archivedItemsCountQuery: queries.archivedGrowthHacksCount
  },
  mutations: {
    addMutation: mutations.growthHacksAdd,
    editMutation: mutations.growthHacksEdit,
    removeMutation: mutations.growthHacksRemove,
    changeMutation: mutations.growthHacksChange,
    watchMutation: mutations.growthHacksWatch,
    archiveMutation: mutations.growthHacksArchive,
    copyMutation: mutations.growthHacksCopy
  },
  texts: {
    addText: 'Add an experiment',
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
