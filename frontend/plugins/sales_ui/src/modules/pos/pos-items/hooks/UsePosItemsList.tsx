import { useQuery } from '@apollo/client';
import queries from '~/modules/pos/pos-items/graphql/queries';
import { IPosItem } from '../types/posItem';

const POS_PER_PAGE = 30;

export const usePosItemsList = (options: { posId?: string } = {}) => {
  const { posId, ...otherOptions } = options;

  const variables: any = {
    perPage: POS_PER_PAGE,
    ...otherOptions,
  };

  if (posId) {
    variables.posId = posId;
  }

  const { data, loading, fetchMore } = useQuery(
    queries.POS_ORDER_RECORDS_QUERY,
    {
      variables,
    },
  );

  const transformedPosList =
    data?.posOrderRecords?.map((posItem: IPosItem) => ({
      // _id: posItem._id,
      ...posItem,
      // name: posItem.name,
      // icon: posItem.icon,
      // isOnline: posItem.isOnline || false,
      // onServer: posItem.onServer || false,
      // branchTitle: posItem.branchTitle || '',
      // departmentTitle: posItem.departmentTitle || '',
      // createdAt: posItem.createdAt,
      // createdBy: posItem.createdBy || '',
      // user: posItem.user,
      // code: posItem.code,
      // barcode: posItem.barcode,
      // categoryName: posItem.categoryName,
      // firstPrice: posItem.firstPrice,
      // salePrice: posItem.salePrice,
      // discount: posItem.discount,
      // discountType: posItem.discountType,
      // count: posItem.count,
      // amount: posItem.amount,
      // paymentType: posItem.paymentType,
      // customerType: posItem.customerType,
      // customer: posItem.customer,
      // companyRD: posItem.companyRD,
      // factor: posItem.factor,
      // billType: posItem.billType,
      // type: posItem.type,
      // cashier: posItem.cashier,
      // pos: posItem.pos,
      // branch: posItem.branch,
      // department: posItem.department,
      // createdDate: posItem.createdDate,
      // createdTime: posItem.createdTime,
      // number: posItem.number,
      // actions: posItem.actions,
      // posId: posItem.posId,
      // branchId: posItem.branchId,
      // departmentId: posItem.departmentId,
    })) || [];

  const handleFetchMore = () => {
    if (!data?.posOrderRecords) {
      return;
    }
    fetchMore({
      variables: {
        page: Math.ceil(transformedPosList.length / POS_PER_PAGE) + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        return Object.assign({}, prev, {
          posOrderRecords: [
            ...(prev.posOrderRecords || []),
            ...fetchMoreResult.posOrderRecords,
          ],
        });
      },
    });
  };

  return {
    loading,
    posItemList: transformedPosList,
    totalCount: data?.posOrderRecords?.totalCount || 0,
    handleFetchMore,
    pageInfo: {
      hasNextPage:
        transformedPosList.length < (data?.posOrderRecords?.totalCount || 0),
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
