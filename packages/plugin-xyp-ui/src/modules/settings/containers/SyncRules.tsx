import { gql } from '@apollo/client';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import List from '../components/SyncRules';
import { mutations, queries } from '../graphql';
import { SyncRulesRemoveMutationResponse, SyncRulesCountQueryResponse, SyncRulesQueryResponse } from '../types';
import { useQuery, useMutation } from '@apollo/client';

type Props = {};

const ListContainer = (props: Props) => {
  const syncRulesQuery = useQuery<SyncRulesQueryResponse>(gql(queries.xypSyncRules));
  const syncRulesCountQuery = useQuery<SyncRulesCountQueryResponse>(
    gql(queries.xypSyncRulesCount)
  );
  const [syncRulesRemove] = useMutation<SyncRulesRemoveMutationResponse>(
    gql(mutations.xypSyncRuleRemove)
  );

  const remove = (syncRule) => {
    confirm(`This action will remove the syncRule. Are you sure?`)
      .then(() => {
        syncRulesRemove({ variables: { _id: syncRule._id } })
          .then(() => {
            Alert.success('You successfully deleted a syncRule');
            syncRulesQuery.refetch();
            syncRulesCountQuery.refetch();
          })
          .catch((e) => {
            Alert.error(e.message);
          });
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object?._id ? mutations.xypSyncRuleEdit : mutations.xypSyncRuleAdd}
        variables={values}
        callback={callback}
        refetchQueries={refetch}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${object ? 'updated' : 'added'
          } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    syncRules: (syncRulesQuery.data && syncRulesQuery.data.xypSyncRules) || [],
    syncRulesCount: syncRulesCountQuery?.data?.xypSyncRulesCount || 0,
    loading: syncRulesQuery.loading || syncRulesCountQuery.loading,
    renderButton,
    remove
  };

  return <List {...updatedProps} />;
};

const refetch = ['syncRules', 'syncRulesTotalCount'];

export default ListContainer;
