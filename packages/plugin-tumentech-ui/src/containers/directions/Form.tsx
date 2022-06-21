import gql from 'graphql-tag';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import DirectionForm from '../../components/directions/Form';
import { mutations, queries } from '../../graphql';
import { useQuery } from 'react-apollo';

type Props = {
  closeModal: () => void;
};

const DirectionFormContainer = (props: Props) => {
  const { data, loading } = useQuery(gql(queries.placesQuery), {
    fetchPolicy: 'network-only',
    variables: { perPage: 9999 }
  });

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.editDirection : mutations.addDirection}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a direction`}
      />
    );
  };

  const updatedProps = {
    ...props,
    places: (data && data.places.list) || [],
    renderButton
  };

  return <DirectionForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.directions)
    }
  ];
};

export default DirectionFormContainer;
