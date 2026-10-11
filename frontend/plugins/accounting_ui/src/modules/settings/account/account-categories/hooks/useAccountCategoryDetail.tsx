import { toGraphqlView } from '@/utils/graphql';
import { useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { accountCategoryDetailAtom } from '../states/accountCategoryStates';
import { useQuery } from '@apollo/client';
import { GET_ACCOUNT_CATEGORY_DETAIL } from '../graphql/queries/getAccountCategory';

export const useAccountCategoryDetail = () => {
  const [accountCategoryId, setAccountCategoryId] =
    useQueryState<string>('accountCategoryId');
  const accountCategoryDetail = useAtomValue(accountCategoryDetailAtom);
  const { data: queryData, loading } = useQuery(GET_ACCOUNT_CATEGORY_DETAIL, {
    variables: { id: accountCategoryId ?? '' },
    skip: !!accountCategoryDetail || !accountCategoryId,
  });
  const data = toGraphqlView(queryData);

  return {
    accountCategoryDetail:
      accountCategoryDetail && accountCategoryDetail?._id === accountCategoryId
        ? accountCategoryDetail
        : data?.accountCategoryDetail,
    loading,
    closeDetail: () => setAccountCategoryId(null),
  };
};
