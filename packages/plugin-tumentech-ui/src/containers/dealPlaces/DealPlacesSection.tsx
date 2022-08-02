import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import DealPlacesSection from '../../components/dealPlaces/DealPlacesSection';
import { mutations, queries } from '../../graphql';

type Props = {
  title: string;
  dealId: string;
};

function DealPlaceSectionContainer(props: Props) {
  const { dealId } = props;

  const dealPlaceQuery = useQuery(gql(queries.dealPlaces), {
    variables: { dealId },
    fetchPolicy: 'network-only'
  });

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      dealPlaceQuery.refetch();

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={mutations.selectWinner}
        variables={values}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  const placesChanged = () => {
    dealPlaceQuery.refetch();
  };

  if (dealPlaceQuery.loading) {
    return <Spinner />;
  }

  const dealPlace = dealPlaceQuery.data.getDealPlace || {};

  return (
    <DealPlacesSection
      {...props}
      dealPlace={dealPlace}
      placesChanged={placesChanged}
      renderButton={renderButton}
    />
  );
}

export default DealPlaceSectionContainer;
