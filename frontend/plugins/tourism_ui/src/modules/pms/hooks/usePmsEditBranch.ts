import { useMutation } from '@apollo/client';
import { pmsMutations } from '@/pms/graphql/mutation';
import { pmsQueries } from '@/pms/graphql/queries';
import { PmsBranchFormType } from '@/pms/constants/formSchema';
import { IPmsPaymentType } from '@/pms/types/branch';
import { nanoid } from 'nanoid';

interface UsePmsEditBranchParams {
  page?: number;
  perPage?: number;
}

export const usePmsEditBranch = ({
  page = 1,
  perPage = 20,
}: UsePmsEditBranchParams = {}) => {
  const [editBranch, { loading, error }] = useMutation(
    pmsMutations.PmsBranchEdit,
    {
      refetchQueries: [
        {
          query: pmsQueries.PmsBranchList,
          variables: { page, perPage },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  const handleEdit = async (
    id: string,
    data: Partial<
      PmsBranchFormType & {
        checkintime?: string;
        checkouttime?: string;
        checkinamount?: number;
        checkoutamount?: number;
      }
    >,
  ) => {
    const discountPayload =
      data.discount !== undefined
        ? data.discount
            .filter((item): item is Partial<IPmsPaymentType> => item != null)
            .map((item) => ({
              ...item,
              _id: item._id || nanoid(),
            }))
        : undefined;

    const result = await editBranch({
      variables: {
        _id: id,
        name: data.name,
        description: data.description,
        user1Ids: data.user1Ids,
        user2Ids: data.user2Ids,
        user3Ids: data.user3Ids,
        user4Ids: data.user4Ids,
        user5Ids: data.user5Ids,
        paymentIds: data.paymentIds,
        paymentTypes: data.paymentTypes,
        erxesAppToken: data.erxesAppToken,
        permissionConfig: data.permissionConfig,
        uiOptions: data.uiOptions,
        pipelineConfig: data.pipelineConfig,
        extraProductCategories: data.extraProductCategories,
        roomCategories: data.roomCategories,
        websiteReservationLock: data.websiteReservationLock,
        time: data.time,
        ...(discountPayload?.length ? { discount: discountPayload } : {}),
        checkintime: data.checkintime ?? data.checkInTime,
        checkouttime: data.checkouttime ?? data.checkOutTime,
        checkinamount: data.checkinamount ?? data.checkInAmount,
        checkoutamount: data.checkoutamount ?? data.checkOutAmount,
      },
    });

    return result.data?.pmsBranchEdit;
  };

  return {
    editBranch: handleEdit,
    loading,
    error,
  };
};
