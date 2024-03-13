import { toArray } from '../boards/utils';
import PurchaseEditForm from './components/PurchaseEditForm';
import PurchaseItem from './components/PurchaseItem';
import { mutations, queries } from './graphql';

const options = {
  EditForm: PurchaseEditForm,
  Item: PurchaseItem,
  title: 'purchase',
  type: 'purchase',
  queriesName: {
    itemsQuery: 'purchases',
    itemsTotalCountQuery: 'purchasesTotalCount',
    detailQuery: 'purchaseDetail',
    archivedItemsQuery: 'archivedPurchases',
    archivedItemsCountQuery: 'archivedPurchasesCount'
  },
  mutationsName: {
    addMutation: 'purchasesAdd',
    editMutation: 'purchasesEdit',
    removeMutation: 'purchasesRemove',
    changeMutation: 'purchasesChange',
    watchMutation: 'purchasesWatch',
    archiveMutation: 'purchasesArchive',
    copyMutation: 'purchasesCopy',
    updateTimeTrackMutation: 'updateTimeTrack'
  },
  queries: {
    itemsQuery: queries.purchases,
    itemsTotalCountQuery: queries.purchasesTotalCount,
    detailQuery: queries.purchaseDetail,
    archivedItemsQuery: queries.archivedPurchases,
    archivedItemsCountQuery: queries.archivedPurchasesCount
  },
  mutations: {
    addMutation: mutations.purchasesAdd,
    editMutation: mutations.purchasesEdit,
    removeMutation: mutations.purchasesRemove,
    changeMutation: mutations.purchasesChange,
    watchMutation: mutations.purchasesWatch,
    archiveMutation: mutations.purchasesArchive,
    copyMutation: mutations.purchasesCopy,
    updateTimeTrackMutation: ``
  },

  texts: {
    addText: 'Add a purchase',
    updateSuccessText: 'You successfully updated a purchase',
    deleteSuccessText: 'You successfully deleted a purchase',
    changeSuccessText: 'You successfully changed a purchase',
    copySuccessText: 'You successfully copied a purchase'
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
