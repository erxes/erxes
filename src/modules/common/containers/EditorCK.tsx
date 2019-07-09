import gql from 'graphql-tag';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import { queries } from '../../settings/team/graphql';
import { UsersQueryResponse } from '../../settings/team/types';
import EditorCK from '../components/EditorCK';
import { IEditorProps, IMentionUser } from '../types';

type Props = {
  showMentions?: boolean;
} & IEditorProps;

type FinalProps = {
  usersQuery: UsersQueryResponse;
} & Props;

const EditorContainer = (props: FinalProps) => {
  const { usersQuery } = props;

  if (usersQuery.loading) {
    return null;
  }

  const users = usersQuery.users || [];

  const mentionUsers: IMentionUser[] = [];

  for (const user of users) {
    if (user.details && user.details.fullName) {
      mentionUsers.push({
        id: user._id,
        avatar: user.details.avatar || '/images/avatar.svg',
        fullName: user.details.fullName
      });
    }
  }

  return <EditorCK {...props} mentionUsers={mentionUsers} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, UsersQueryResponse>(gql(queries.users), {
      name: 'usersQuery'
    })
  )(EditorContainer)
);
