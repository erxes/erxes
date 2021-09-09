import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import Spinner from 'modules/common/components/Spinner';
import Sidebar from 'modules/layout/components/Sidebar';
import GenerateCustomFields from 'modules/settings/properties/components/GenerateCustomFields';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { FieldsGroupsQueryResponse } from '../../../settings/properties/types';
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

  const groups = fieldsGroupsQuery.fieldsGroups || [];

  const updatedProps = {
    save,
    loading,
    customFieldsData: user.customFieldsData,
    fieldsGroups: groups.filter(e => !e.isDefinedByErxes),
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
            contentType: FIELDS_GROUPS_CONTENT_TYPES.USER
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
