import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import Participants from '../components/Participants';
import { queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  title: string;
  dealId: string;
};

function ParticipantContainer(props: Props) {
  const { dealId } = props;

  const participantsGroupQuery = useQuery(gql(queries.participants), {
    variables: { dealId },
    fetchPolicy: 'network-only'
  });

  // const getRefetchQueries = () => {
  //   return [
  //     {
  //       query:
  //         (gql(queries.participants),
  //         {
  //           variables: { dealId },
  //           fetchPolicy: 'network-only',
  //         }),
  //     },
  //   ];
  // };

  //   const renderButton = ({
  //     name,
  //     values,
  //     isSubmitted,
  //     callback,
  //     object
  //   }: IButtonMutateProps) => {
  //     return (
  //       <ButtonMutate
  //         mutation={mutations.usersInvite}
  //         variables={values}
  //         callback={callback}
  //         refetchQueries={getRefetchQueries()}
  //         isSubmitted={isSubmitted}
  //         type="submit"
  //         successMessage={`You successfully ${
  //           object ? 'updated' : 'added'
  //         } a ${name}`}
  //       />
  //     );
  //   };

  if (participantsGroupQuery.loading) {
    return <Spinner />;
  }

  const participants = participantsGroupQuery.data.participants || [];

  return <Participants name={''} {...props} participants={participants} />;
}

export default ParticipantContainer;
