import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import { mutations } from '../../graphql';
import {
  EditCustomFieldsMutationVariables,
  EditMutationResponse,
  IConversation
} from '../../types';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import GenerateCustomFields from '@erxes/ui-settings/src/properties/components/GenerateCustomFields';
import { queries as fieldQueries } from '@erxes/ui-settings/src/properties/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { renderWithProps } from '@erxes/ui/src/utils';
import { FieldsGroupsQueryResponse } from '@erxes/ui-settings/src/properties/types';

type Props = {
  conversation: IConversation;
  loading?: boolean;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props &
  EditMutationResponse;

const ConversationCustomFieldsSection = (props: FinalProps) => {
  const { loading, conversation, fieldsGroupsQuery, editCustomFields } = props;

  if (fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = conversation;

  const save = (data, callback) => {
    editCustomFields({
      variables: { _id, ...data }
    })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const updatedProps = {
    save,
    loading,
    isDetail: false,
    customFieldsData: conversation.customFieldsData,
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || []
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default (props: Props) => {
  return renderWithProps<Props>(
    props,
    compose(
      graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
        gql(fieldQueries.fieldsGroups),
        {
          name: 'fieldsGroupsQuery',
          options: () => ({
            variables: {
              contentType: 'conversation',
              isDefinedByErxes: false
            }
          })
        }
      ),
      graphql<Props, EditMutationResponse, EditCustomFieldsMutationVariables>(
        gql(mutations.editCustomFields),
        {
          name: 'editCustomFields',
          options: ({ conversation }) => ({
            variables: {
              _id: conversation._id,
              customFieldsData: ''
            }
          })
        }
      )
    )(ConversationCustomFieldsSection)
  );
};
