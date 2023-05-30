import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { gql, useQuery } from '@apollo/client';
import React from 'react';

import DealRoute from '../../components/dealRoute/DealRouteSection';
import { mutations, queries } from '../../graphql';

type Props = {
  dealId: string;
};

function DealRouteSectionContainer(props: Props) {
  const { dealId } = props;

  const dealRouteQry = useQuery(gql(queries.dealRouteQuery), {
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
      dealRouteQry.refetch();

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
    dealRouteQry.refetch();
  };

  if (dealRouteQry.loading) {
    return <Spinner />;
  }

  const dealRoute = dealRouteQry.data.getDealRoute || {};

  return <DealRoute {...props} dealRoute={dealRoute} />;
}

export default DealRouteSectionContainer;
