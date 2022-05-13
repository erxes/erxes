import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import ParticipantsSection from '../../components/participants/ParticipantsSection';
import { mutations, queries } from '../../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';

type Props = {
  title: string;
  dealId: string;
};

function ParticipantContainer(props: Props) {
  const { dealId } = props;

  const participantsQuery = useQuery(gql(queries.participants), {
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
      participantsQuery.refetch();

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

  const participantsChanged = () => {
    participantsQuery.refetch();
  };

  if (participantsQuery.loading) {
    return <Spinner />;
  }

  const participants = participantsQuery.data.participants || [];

  return (
    <ParticipantsSection
      {...props}
      participants={participants}
      participantsChanged={participantsChanged}
      renderButton={renderButton}
    />
  );
}

export default ParticipantContainer;
