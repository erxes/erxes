import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import { queries } from '../../settings/team/graphql';
import { AllUsersQueryResponse } from '../../settings/team/types';
import EditorCK from '../components/EditorCK';
import { IEditorProps, IMentionUser } from '../types';
import { isValidURL } from '../utils/urlParser';

type Props = {
  showMentions?: boolean;
} & IEditorProps;

type FinalProps = {
  usersQuery: AllUsersQueryResponse;
} & Props;

const EditorContainer = (props: FinalProps) => {
  const { usersQuery } = props;

  if (usersQuery.loading) {
    return null;
  }

  const users = usersQuery.allUsers || [];
  const mentionUsers: IMentionUser[] = [];

  for (const user of users) {
    if (user.details && user.details.fullName) {
      const avatar = user.details.avatar || '/images/avatar-colored.svg';
      
      mentionUsers.push({
        id: user._id,
        avatar: isValidURL(avatar) ? avatar : '/images/avatar-colored.svg',
        fullName: user.details.fullName
      });
    }
  }

  return <EditorCK {...props} mentionUsers={mentionUsers} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, AllUsersQueryResponse>(gql(queries.allUsers), {
      name: 'usersQuery',
      options: () => ({
        variables: { isActive: true }
      })
    })
  )(EditorContainer)
);
