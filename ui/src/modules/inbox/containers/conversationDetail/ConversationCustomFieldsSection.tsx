import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { mutations } from 'modules/inbox/graphql';
import {
  EditCustomFieldsMutationVariables,
  EditMutationResponse,
  IConversation
} from 'modules/inbox/types';
import Sidebar from 'modules/layout/components/Sidebar';
import GenerateCustomFields from 'modules/settings/properties/components/GenerateCustomFields';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { renderWithProps } from '../../../common/utils';
import { FieldsGroupsQueryResponse } from '../../../settings/properties/types';

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

  const groups = fieldsGroupsQuery.fieldsGroups || [];

  const updatedProps = {
    save,
    loading,
    isDetail: false,
    customFieldsData: conversation.customFieldsData,
    fieldsGroups: groups.filter(e => !e.isDefinedByErxes)
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
              contentType: 'conversation'
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
