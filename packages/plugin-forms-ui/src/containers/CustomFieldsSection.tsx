import * as compose from 'lodash.flowright';

import { mutations, queries } from '@erxes/ui/src/team/graphql';

import { EditMutationResponse } from '@erxes/ui/src/team/types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Spinner from '@erxes/ui/src/components/Spinner';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';

const GenerateCustomFields = asyncComponent(() =>
  import(
    /* webpackChunkName: "GenerateCustomFields" */ '@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields'
  )
);

type Props = {
  user: IUser;
  loading?: boolean;
  isDetail: boolean;
};

type FinalProps = {
  fieldsGroupsQuery: any; //check - FieldsGroupsQueryResponse
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
    isDetail,
    doc: user
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, any, { contentType: string }>(gql(queries.fieldsGroups), {
      //check - FieldsGroupsQueryResponse
      name: 'fieldsGroupsQuery',
      options: () => ({
        variables: {
          contentType: 'core:user',
          isDefinedByErxes: false
        }
      })
    }),

    // mutations
    graphql<Props, EditMutationResponse, IUser>(gql(mutations.usersEdit), {
      name: 'usersEdit',
      options: () => ({
        refetchQueries: ['userDetail']
      })
    })
  )(CustomFieldsSection)
);
