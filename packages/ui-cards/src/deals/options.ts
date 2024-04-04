import { toArray } from '../boards/utils';
import DealEditForm from './components/DealEditForm';
import DealItem from './components/DealItem';
import { mutations, queries } from './graphql';

const options = {
  EditForm: DealEditForm,
  Item: DealItem,
  title: 'Deal',
  type: 'deal',
  queriesName: {
    itemsQuery: 'deals',
    itemsTotalCountQuery: 'dealsTotalCount',
    detailQuery: 'dealDetail',
    archivedItemsQuery: 'archivedDeals',
    archivedItemsCountQuery: 'archivedDealsCount'
  },
  mutationsName: {
    addMutation: 'dealsAdd',
    editMutation: 'dealsEdit',
    removeMutation: 'dealsRemove',
    changeMutation: 'dealsChange',
    watchMutation: 'dealsWatch',
    archiveMutation: 'dealsArchive',
    copyMutation: 'dealsCopy',
    updateTimeTrackMutation: 'updateTimeTrack'
  },
  queries: {
    itemsQuery: queries.deals,
    itemsTotalCountQuery: queries.dealsTotalCount,
    detailQuery: queries.dealDetail,
    archivedItemsQuery: queries.archivedDeals,
    archivedItemsCountQuery: queries.archivedDealsCount
  },
  mutations: {
    addMutation: mutations.dealsAdd,
    editMutation: mutations.dealsEdit,
    removeMutation: mutations.dealsRemove,
    changeMutation: mutations.dealsChange,
    watchMutation: mutations.dealsWatch,
    archiveMutation: mutations.dealsArchive,
    copyMutation: mutations.dealsCopy,
    updateTimeTrackMutation: ``
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
    const {
      priority,
      productIds,
      userIds,
      startDate,
      endDate,
      createdStartDate,
      createdEndDate,
      stateChangedStartDate,
      stateChangedEndDate,
      startDateStartDate,
      startDateEndDate,
      closeDateStartDate,
      closeDateEndDate
    } = queryParams;
    const extraParams: any = {};

    if (priority) {
      extraParams.priority = toArray(priority);
    }

    if (userIds) {
      extraParams.userIds = toArray(userIds);
    }

    if (startDate) {
      extraParams.startDate = startDate;
    }

    if (endDate) {
      extraParams.endDate = endDate;
    }

    if (createdStartDate) {
      extraParams.createdStartDate = createdStartDate;
    }

    if (createdEndDate) {
      extraParams.createdEndDate = createdEndDate;
    }

    if (stateChangedStartDate) {
      extraParams.stateChangedStartDate = stateChangedStartDate;
    }

    if (stateChangedEndDate) {
      extraParams.stateChangedEndDate = stateChangedEndDate;
    }
    if (startDateStartDate) {
      extraParams.startDateStartDate = startDateStartDate;
    }

    if (startDateEndDate) {
      extraParams.startDateEndDate = startDateEndDate;
    }
    if (closeDateStartDate) {
      extraParams.closeDateStartDate = closeDateStartDate;
    }

    if (closeDateEndDate) {
      extraParams.closeDateEndDate = closeDateEndDate;
    }

    if (productIds) {
      extraParams.productIds = toArray(productIds);
    }

    return extraParams;
  }
};

export default options;
