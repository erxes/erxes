import {
  ApolloError,
  OperationVariables,
  TypedDocumentNode,
  useMutation,
} from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  LOYALTY_ACCOUNT_TYPE_ADD,
  LOYALTY_ACCOUNT_TYPE_ARCHIVE,
  LOYALTY_ACCOUNT_TYPE_EDIT,
  LOYALTY_ACCOUNT_TYPE_UNARCHIVE,
  LOYALTY_ACCOUNTS_ADOPT_CAMPAIGN_FIELDS,
} from '../graphql/loyaltyAccountTypeMutations';
// Account type changes show up in the account type list, the legacy banner and the
// campaign account type selector, so each of them is refetched.
const REFETCH_QUERIES = [
  'LoyaltyAccountTypeList',
  'LoyaltyAccountTypeLegacyFieldCount',
  'GetScoreCampaigns',
  // A wallet's time settings decide whether and what the period run does.
  'LoyaltyPeriodRunStatus',
];

const useAccountMutation = <TData, TVariables extends OperationVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  successMessage: string,
) => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const [mutate, { loading }] = useMutation(document, {
    refetchQueries: REFETCH_QUERIES,
    awaitRefetchQueries: true,
  });

  const run = (variables: TVariables, onDone?: (data: TData) => void) =>
    mutate({
      variables,
      onCompleted: (data) => {
        toast({ title: t(successMessage), variant: 'success' });
        onDone?.(data);
      },
      onError: (error: ApolloError) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
    });

  return { run, loading };
};

export const useLoyaltyAccountTypeAdd = () =>
  useAccountMutation(LOYALTY_ACCOUNT_TYPE_ADD, 'loyalty-account-type-created');

export const useLoyaltyAccountTypeEdit = () =>
  useAccountMutation(LOYALTY_ACCOUNT_TYPE_EDIT, 'loyalty-account-type-updated');

export const useLoyaltyAccountTypeArchive = () =>
  useAccountMutation(
    LOYALTY_ACCOUNT_TYPE_ARCHIVE,
    'loyalty-account-type-archived',
  );

export const useLoyaltyAccountTypeUnarchive = () =>
  useAccountMutation(
    LOYALTY_ACCOUNT_TYPE_UNARCHIVE,
    'loyalty-account-type-restored',
  );

export const useLoyaltyAccountTypesAdoptCampaignFields = () =>
  useAccountMutation(
    LOYALTY_ACCOUNTS_ADOPT_CAMPAIGN_FIELDS,
    'loyalty-account-types-adopted',
  );
