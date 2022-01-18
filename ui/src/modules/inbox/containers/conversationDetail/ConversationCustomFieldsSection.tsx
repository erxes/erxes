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
import { ConfigsQueryResponse } from 'modules/settings/general/types';
import GenerateCustomFields from 'modules/settings/properties/components/GenerateCustomFields';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import { queries as settingsQueries } from 'modules/settings/general/graphql';
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
  configsQuery: ConfigsQueryResponse;
} & Props &
  EditMutationResponse;

const ConversationCustomFieldsSection = (props: FinalProps) => {
  const {
    loading,
    conversation,
    fieldsGroupsQuery,
    configsQuery,
    editCustomFields
  } = props;

  if (fieldsGroupsQuery.loading || configsQuery.loading) {
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
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || [],
    configs: configsQuery.configs || []
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
      graphql<{}, ConfigsQueryResponse>(gql(settingsQueries.configs), {
        name: 'configsQuery'
      }),
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
