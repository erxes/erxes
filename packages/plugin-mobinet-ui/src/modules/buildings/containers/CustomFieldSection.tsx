import * as compose from 'lodash.flowright';

// import { AssetEditMutationResponse, IAsset } from '../../../common/types';

import GenerateCustomFields from '@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields';
import { FIELDS_GROUPS_CONTENT_TYPES } from '@erxes/ui-forms/src/settings/properties/constants';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { FieldsGroupsQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { withProps } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '../graphql';
import { EditMutationResponse } from '../../../types';
import { IBuilding } from '../types';

type Props = {
  building: IBuilding;
  loading?: boolean;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props &
  EditMutationResponse;
// &
// AssetEditMutationResponse;

const CustomFieldsSection = (props: FinalProps) => {
  const { loading, building, editMutation, fieldsGroupsQuery } = props;

  if (fieldsGroupsQuery && fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = building;

  const save = (data, callback) => {
    editMutation({
      variables: { _id, name: building.name, ...data },
    })
      .then(() => {
        callback();
      })
      .catch((e) => {
        callback(e);
      });
  };
  const collapseCallback = () => {};
  const updatedProps = {
    save,
    loading,
    customFieldsData: building?.customFieldsData || [],
    fieldsGroups: (fieldsGroupsQuery && fieldsGroupsQuery.fieldsGroups) || [],
    isDetail: true,
    collapseCallback,
  };

  return <GenerateCustomFields {...updatedProps} />;
};

const options = () => ({
  refetchQueries: ['BuildingDetail'],
});

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(fieldQueries.fieldsGroups),
      {
        name: 'fieldsGroupsQuery',
        options: () => ({
          variables: {
            contentType: 'mobinet:Building',
            isDefinedByErxes: false,
          },
        }),
        skip: !isEnabled('forms'),
      },
    ),
    graphql<Props, EditMutationResponse, IBuilding>(
      gql(mutations.editMutation),
      {
        name: 'editMutation',
        options,
      },
    ),
  )(CustomFieldsSection),
);
