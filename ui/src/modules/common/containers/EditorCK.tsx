import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import segmentQueries from 'modules/segments/graphql/queries';
import { FieldsCombinedByType, FieldsCombinedByTypeQueryResponse } from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import { queries } from '../../settings/team/graphql';
import { AllUsersQueryResponse } from '../../settings/team/types';
import EditorCK from '../components/EditorCK';
import { IEditorProps, IMentionUser } from '../types';
import { isValidURL } from '../utils/urlParser';

const generateAttributes = (combinedFields?: FieldsCombinedByType[]) => {
    let items: Array<{ name: string, value?: string }> = [
      { name: 'Customer' },
      { value: 'customer.name', name: 'Name' },
    ];

    (combinedFields || []).forEach(field => items.push({ value: `customer.${field.name}`, name: field.label }));

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
}

type Props = {
  showMentions?: boolean;
} & IEditorProps;

type FinalProps = {
  usersQuery: AllUsersQueryResponse;
  combinedFieldsQuery: FieldsCombinedByTypeQueryResponse;
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
    if (user.details && user.details.fullName) {
      const avatar = user.details.avatar || '/images/avatar-colored.svg';

      mentionUsers.push({
        id: user._id,
        avatar: isValidURL(avatar) ? avatar : '/images/avatar-colored.svg',
        fullName: user.details.fullName
      });
    }
  }

  const insertItems = props.insertItems || generateAttributes(combinedFields);

  return <EditorCK {...props} mentionUsers={mentionUsers} insertItems={insertItems} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, AllUsersQueryResponse>(gql(queries.allUsers), {
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
