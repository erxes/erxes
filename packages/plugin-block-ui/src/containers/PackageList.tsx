import { Alert, confirm } from '@erxes/ui/src/utils';
import { PackagesQueryResponse, PackageRemoveMutationResponse } from '../types';
import { mutations, queries } from '../graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import PackageList from '../components/PackageList';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  type: string;
};

const ListContainer = (props: Props) => {
  const packagesQuery = useQuery<PackagesQueryResponse>(gql(queries.packages));
  const [packagesRemove] = useMutation<PackageRemoveMutationResponse>(
    gql(mutations.packagesRemove),
  );

  if (packagesQuery.loading) {
    return <Spinner />;
  }

  const remove = (tag) => {
    confirm(`Are you sure?`)
      .then(() => {
        packagesRemove({ variables: { _id: tag._id } })
          .then(() => {
            Alert.success('You successfully deleted a package');
            packagesQuery.refetch();
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
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object._id ? mutations.packagesEdit : mutations.packagesAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a package`}
      />
    );
  };

  const updatedProps = {
    ...props,
    packages: (packagesQuery.data && packagesQuery.data.packages) || [],
    loading: packagesQuery.loading,
    remove,
    renderButton,
  };

  return <PackageList {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.packages),
    },
  ];
};

export default ListContainer;
