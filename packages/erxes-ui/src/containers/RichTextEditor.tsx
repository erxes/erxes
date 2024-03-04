import * as compose from 'lodash.flowright';

import { IEditorProps } from '../types';

import { UsersQueryResponse } from '../auth/types';
import React from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { isEnabled } from '../utils/core';
import segmentQueries from './queries';
import { queries as teamQueries } from '../team/graphql';
import { readFile, withProps } from '../utils';
import { capitalize } from 'lodash';
import { RichTextEditor } from '../components/richTextEditor/TEditor';

interface ITeamMembers {
  id: string;
  username: string;
  fullName?: string;
  title?: string;
  avatar?: string;
}

const generateAttributes = (combinedFields?: any[], contentType?: string) => {
  // check - FieldsCombinedByType
  let items: Array<{ name: string; value?: string }> = [
    { name: 'Customer' },
    { value: 'customer.name', name: 'Name' },
  ];

  if (contentType) {
    const [_serviceName, type] = contentType.split(':');

    items.splice(0);

    items = [{ name: capitalize(type) }].concat(
      (combinedFields || []).map((field) => ({
        value: `${type}.${field.name}`,
        name: field.label,
      })),
    );
  } else {
    (combinedFields || []).forEach((field) =>
      items.push({ value: `customer.${field.name}`, name: field.label }),
    );
  }

  items = [
    ...items,
    { name: 'User' },
    { value: 'user.fullName', name: 'Fullname' },
    { value: 'user.position', name: 'Position' },
    { value: 'user.email', name: 'Email' },

    { name: 'Organization' },
    { value: 'brandName', name: 'BrandName' },
    { value: 'domain', name: 'Domain' },
  ];

  return {
    items,
    title: 'Attributes',
    label: 'Attributes',
  };
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  combinedFieldsQuery: any; // check - FieldsCombinedByTypeQueryResponse
  leadsQuery: any; // check - LeadIntegrationsQueryResponse
} & IEditorProps;

const EditorContainer = (props: FinalProps) => {
  const {
    combinedFieldsQuery,
    contentType,
    insertItems,
    showMentions,
    ...otherProps
  } = props;

  const [fetchMentions] = useLazyQuery(gql(teamQueries.userList));

  const getVariables = (query: string) => {
    return { searchValue: query };
  };

  const extractFunction = (queryResult: UsersQueryResponse) => {
    const mentionUsers: ITeamMembers[] = [];
    for (const user of queryResult.users || []) {
      mentionUsers.push({
        id: user._id,
        username: user.username?.trim(),
        fullName: user.details && user.details.fullName?.trim(),
        title: user.details && user.details.position,
        avatar:
          user.details &&
          user.details.avatar &&
          readFile(user.details.avatar, 44),
      });
    }
    return mentionUsers;
  };

  if (combinedFieldsQuery && combinedFieldsQuery.loading) {
    return null;
  }

  const combinedFields = combinedFieldsQuery
    ? combinedFieldsQuery.fieldsCombinedByContentType || []
    : [];

  const placeholderItems =
    insertItems || generateAttributes(combinedFields, contentType);

  return (
    <RichTextEditor
      {...otherProps}
      showMentions={showMentions}
      {...(showMentions && {
        mentionSuggestion: { getVariables, fetchMentions, extractFunction },
      })}
      placeholderProp={placeholderItems}
    />
  );
};

export default withProps<IEditorProps>(
  compose(
    graphql<IEditorProps>(gql(segmentQueries.combinedFields), {
      name: 'combinedFieldsQuery',
      options: ({ contentType }) => ({
        variables: {
          contentType: contentType || 'customer',
        },
      }),
      skip: !isEnabled('segments'),
    }),
  )(EditorContainer),
);
