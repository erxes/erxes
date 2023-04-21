import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import AccountSection from '../../components/account/AccountSection';
import { queries } from '../../graphql';

type Props = {
  customerId: string;
};

function AccoutSectionContainer(props: Props) {
  const { customerId } = props;

  const { data, loading, error } = useQuery(gql(queries.customerAccountQry), {
    variables: { customerId },
    fetchPolicy: 'network-only'
  });

  // const renderButton = ({
  //   name,
  //   values,
  //   isSubmitted,
  //   callback
  // }: IButtonMutateProps) => {
  //   const callBackResponse = () => {
  //     dealPlaceQuery.refetch();

  //     if (callback) {
  //       callback();
  //     }
  //   };

  //   return (
  //     <ButtonMutate
  //       mutation={mutations.selectWinner}
  //       variables={values}
  //       callback={callBackResponse}
  //       isSubmitted={isSubmitted}
  //       type="submit"
  //       successMessage={`You successfully added a ${name}`}
  //     />
  //   );
  // };

  // const placesChanged = () => {
  //   dealPlaceQuery.refetch();
  // };

  if (loading) {
    return <Spinner />;
  }

  const customerAccount = data.customerAccount || {};

  return <AccountSection {...props} customerAccount={customerAccount} />;
}

export default AccoutSectionContainer;
