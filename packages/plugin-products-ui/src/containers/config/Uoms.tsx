import { gql } from '@apollo/client';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import List from '../../components/config/Uoms';
import { mutations, queries } from '../../graphql';
import { UomRemoveMutationResponse, UomsCountQueryResponse } from '../../types';
import { UomsQueryResponse } from '@erxes/ui-products/src/types';
import { useQuery, useMutation } from '@apollo/client';

type Props = {};

const ListContainer = (props: Props) => {
  const uomsQuery = useQuery<UomsQueryResponse>(gql(queries.uoms));
  const uomsCountQuery = useQuery<UomsCountQueryResponse>(
    gql(queries.uomsTotalCount)
  );
  const [uomsRemove] = useMutation<UomRemoveMutationResponse>(
    gql(mutations.uomsRemove)
  );

  const remove = (uom) => {
    confirm(`This action will remove the uom. Are you sure?`)
      .then(() => {
        uomsRemove({ variables: { uomIds: [uom._id] } })
          .then(() => {
            Alert.success('You successfully deleted a uom');
            uomsQuery.refetch();
            uomsCountQuery.refetch();
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
        mutation={object ? mutations.uomsEdit : mutations.uomsAdd}
        variables={values}
        callback={callback}
        refetchQueries={refetch}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    uoms: (uomsQuery.data && uomsQuery.data.uoms) || [],
    uomsTotalCount:
      (uomsCountQuery.data && uomsCountQuery.data.uomsTotalCount) || 0,
    loading: uomsQuery.loading || uomsCountQuery.loading,
    renderButton,
    remove
  };

  return <List {...updatedProps} />;
};

const refetch = ['uoms', 'uomsTotalCount'];

export default ListContainer;
