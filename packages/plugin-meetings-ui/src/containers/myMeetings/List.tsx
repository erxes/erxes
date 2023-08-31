import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { mutations, queries } from '../../graphql';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { Spinner } from '@erxes/ui/src/components';
import { ListComponent } from '../../components/myMeetings/List';
import { graphql } from '@apollo/client/react/hoc';
import * as compose from 'lodash.flowright';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
import { RemoveMutationResponse } from '../../types';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  currentUser: IUser;
} & Props &
  RemoveMutationResponse;

const MyMeetingListContainer = (props: FinalProps) => {
  const { queryParams, removeMutation } = props;
  const { createdAtFrom, createdAtTo, ownerId, companyId } = queryParams;

  const { data, loading } = useQuery(gql(queries.meetings), {
    variables: { createdAtFrom, createdAtTo, userId: ownerId, companyId }
  });

  if (loading) {
    return <Spinner />;
  }

  const remove = (id: string) => {
    confirm('You are about to delete the item. Are you sure? ')
      .then(() => {
        removeMutation({ variables: { _id: id } })
          .then(() => {
            Alert.success('Successfully deleted an item');
          })
          .catch(e => Alert.error(e.message));
      })
      .catch(e => Alert.error(e.message));
  };

  const updatedProps = {
    ...props,
    remove,
    meetings: data.meetings
  };
  return <ListComponent {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(mutations.remove), {
      name: 'removeMutation',
      options: () => ({
        refetchQueries: ['meetings']
      })
    })
  )(withCurrentUser(MyMeetingListContainer))
);
