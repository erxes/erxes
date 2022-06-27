import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries as segmentQueries } from '@erxes/ui-segments/src/graphql';
import { LeadIntegrationsQueryResponse } from '@erxes/ui-leads/src/types';
import {
  FieldsCombinedByType,
  FieldsCombinedByTypeQueryResponse
} from '@erxes/ui-settings/src/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../utils';
import { queries as teamQueries } from '../team/graphql';
import { AllUsersQueryResponse } from '../auth/types';
import EditorCK from '../components/EditorCK';
import { IEditorProps, IMentionUser } from '../types';
import { isValidURL } from '../utils/urlParser';

const generateAttributes = (combinedFields?: FieldsCombinedByType[]) => {
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
  combinedFieldsQuery: FieldsCombinedByTypeQueryResponse;
  leadsQuery: LeadIntegrationsQueryResponse;
} & Props;

const EditorContainer = (props: FinalProps) => {
  const { usersQuery, combinedFieldsQuery } = props;

  if (usersQuery.loading || combinedFieldsQuery.loading) {
    return null;
  }

  const combinedFields = combinedFieldsQuery.fieldsCombinedByContentType || [];
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
      })
    })
  )(EditorContainer)
);
