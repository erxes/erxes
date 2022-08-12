import { IUser } from '@erxes/ui/src/auth/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { withProps } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import asyncComponent from '../../components/AsyncComponent';
import { isEnabled } from '../../utils/core';
import { mutations, queries } from '../graphql';
import { EditMutationResponse } from '../types';

const GenerateCustomFields = asyncComponent(
  () =>
    isEnabled('forms') &&
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
