import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from '@erxes/ui/src/auth/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import GenerateCustomFields from '@erxes/ui-settings/src//properties/components/GenerateCustomFields';
import { FIELDS_GROUPS_CONTENT_TYPES } from '@erxes/ui-settings/src/properties/constants';
import { queries as fieldQueries } from '@erxes/ui-settings/src/properties/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import { FieldsGroupsQueryResponse } from '@erxes/ui-settings/src/properties/types';
import { mutations } from '../graphql';
import { EditMutationResponse } from '../types';

type Props = {
  user: IUser;
  loading?: boolean;
  isDetail: boolean;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props &
  EditMutationResponse;

const CustomFieldsSection = (props: FinalProps) => {
  const { user, usersEdit, fieldsGroupsQuery, loading, isDetail } = props;

  if (fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = user;

  const save = (variables, callback) => {
    usersEdit({
      variables: { _id, ...variables }
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
    customFieldsData: user.customFieldsData,
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || [],
    isDetail
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(fieldQueries.fieldsGroups),
      {
        name: 'fieldsGroupsQuery',
        options: () => ({
          variables: {
            contentType: FIELDS_GROUPS_CONTENT_TYPES.USER,
            isDefinedByErxes: false
          }
        })
      }
    ),

    // mutations
    graphql<Props, EditMutationResponse, IUser>(gql(mutations.usersEdit), {
      name: 'usersEdit',
      options: () => ({
        refetchQueries: ['userDetail']
      })
    })
  )(CustomFieldsSection)
);
