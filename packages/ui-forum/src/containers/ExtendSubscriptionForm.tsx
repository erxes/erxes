import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { mutations, queries } from '../graphql';
import ExtendSubscriptionForm from '../components/ExtendSubscriptionForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';

type Props = {
  clientPortalUser: any;
  closeModal?: () => void;
};

const ExtendSubscription = ({ clientPortalUser, closeModal }: Props) => {
  const userQuery = useQuery(gql(queries.clientPortalUserQuery), {
    variables: {
      id: clientPortalUser._id
    }
  });

  const userDetail = userQuery.data?.clientPortalUserDetail;

  const renderButton = ({
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.extendSubscription}
        variables={values}
        callback={callback}
        refetchQueries={['clientPortalUserDetail', 'clientPortalUser']}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully extended subscription`}
      />
    );
  };

  return (
    <ExtendSubscriptionForm
      closeModal={closeModal}
      user={userDetail}
      renderButton={renderButton}
    />
  );
};
export default ExtendSubscription;
