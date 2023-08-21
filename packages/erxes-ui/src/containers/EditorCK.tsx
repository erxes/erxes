import * as compose from 'lodash.flowright';

import { IEditorProps, IMentionUser } from '../types';

import { AllUsersQueryResponse } from '../auth/types';
import EditorCK from '../components/EditorCK';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { isEnabled } from '../utils/core';
import { isValidURL } from '../utils/urlParser';
import segmentQueries from './queries';
import { queries as teamQueries } from '../team/graphql';
import { withProps } from '../utils';

const generateAttributes = (combinedFields?: any[]) => {
  //check - FieldsCombinedByType
  let items: Array<{ name: string; value?: string }> = [
    { name: 'Customer' },
    { value: 'customer.name', name: 'Name' }
  ];

  (combinedFields || []).forEach(field =>
    items.push({ value: `customer.${field.name}`, name: field.label })
  );

  items = [
    ...items,
    { name: 'User' },
    { value: 'user.fullName', name: 'Fullname' },
    { value: 'user.position', name: 'Position' },
    { value: 'user.email', name: 'Email' },

    { name: 'Organization' },
    { value: 'brandName', name: 'BrandName' },
    { value: 'domain', name: 'Domain' }
  ];

  return {
    items,
    title: 'Attributes',
    label: 'Attributes'
  };
};

type Props = {
  showMentions?: boolean;
} & IEditorProps;

type FinalProps = {
  usersQuery: AllUsersQueryResponse;
  combinedFieldsQuery: any; //check - FieldsCombinedByTypeQueryResponse
  leadsQuery: any; //check - LeadIntegrationsQueryResponse
} & Props;

const EditorContainer = (props: FinalProps) => {
  const { usersQuery, combinedFieldsQuery } = props;

  if (
    usersQuery.loading ||
    (combinedFieldsQuery && combinedFieldsQuery.loading)
  ) {
    return null;
  }

  const combinedFields = combinedFieldsQuery
    ? combinedFieldsQuery.fieldsCombinedByContentType || []
    : [];
  const users = usersQuery.allUsers || [];
  const mentionUsers: IMentionUser[] = [];

  for (const user of users) {
    if (user.details && user.username) {
      const avatar = user.details.avatar || '/images/avatar-colored.svg';

      mentionUsers.push({
        id: user._id,
        avatar: isValidURL(avatar) ? avatar : '/images/avatar-colored.svg',
        username: user.username
      });
    }
  }

  const insertItems = props.insertItems || generateAttributes(combinedFields);

  return (
    <EditorCK
      {...props}
      mentionUsers={mentionUsers}
      insertItems={insertItems}
    />
  );
};

export default withProps<Props>(
  compose(
    graphql<Props, AllUsersQueryResponse>(gql(teamQueries.allUsers), {
      name: 'usersQuery',
      options: () => ({
        variables: { isActive: true }
      })
    }),

    graphql<Props>(gql(segmentQueries.combinedFields), {
      name: 'combinedFieldsQuery',
      options: () => ({
        variables: {
          contentType: 'customer'
        }
      }),
      skip: !isEnabled('segments')
    })
  )(EditorContainer)
);
