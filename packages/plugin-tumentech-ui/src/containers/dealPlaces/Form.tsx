import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import DealPlaceForm from '../../components/dealPlaces/Form';
import { mutations, queries } from '../../graphql';
import { IDealPlace } from '../../types';

type Props = {
  dealId: string;
  dealPlace?: IDealPlace;
  closeModal: () => void;
};

const DealPlaceFormContainer = (props: Props) => {
  const { data } = useQuery(gql(queries.placesQuery), {
    fetchPolicy: 'network-only',
    variables: { perPage: 9999 }
  });

  const renderButton = ({
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.setDealPlace}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(props.dealId)}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully updated a location`}
      />
    );
  };

  const updatedProps = {
    ...props,
    places: (data && data.places.list) || [],
    renderButton
  };

  return <DealPlaceForm {...updatedProps} />;
};

const getRefetchQueries = (dealId: string) => {
  return [
    {
      query: gql(queries.dealPlaces),
      variables: {
        dealId
      }
    }
  ];
};

export default DealPlaceFormContainer;
