import * as compose from 'lodash.flowright';

import { AssetEditMutationResponse, IAsset } from '../../../common/types';

import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import GenerateCustomFields from '@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { FieldsGroupsQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { withProps } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';
import { mutations, queries } from '../../graphql';

type Props = {
  asset: IAsset;
  loading?: boolean;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props &
  AssetEditMutationResponse;

const CustomFieldsSection = (props: FinalProps) => {
  const { loading, asset, editMutation, fieldsGroupsQuery } = props;

  if (fieldsGroupsQuery && fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const save = (data, callback) => {
    editMutation({
      variables: { ...asset, ...data },
    })
      .then(() => {
        callback();
      })
      .catch((e) => {
        callback(e);
      });
  };

  const updatedProps = {
    save,
    loading,
    customFieldsData: asset.customFieldsData,
    fieldsGroups: (fieldsGroupsQuery && fieldsGroupsQuery.fieldsGroups) || [],
    isDetail: true,
    object: asset,
  };

  return <GenerateCustomFields {...updatedProps} />;
};

const options = (asset) => ({
  refetchQueries: [
    {
      query: gql(queries.assetDetail),
      variables: {
        _id: asset._id,
      },
    },
  ],
});

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(fieldQueries.fieldsGroups),
      {
        name: 'fieldsGroupsQuery',
        options: () => ({
          variables: {
            contentType: 'assets:asset',
            isDefinedByErxes: false,
          },
        }),
        skip: !isEnabled('forms'),
      },
    ),
    graphql<Props, AssetEditMutationResponse, IAsset>(
      gql(mutations.assetEdit),
      {
        name: 'editMutation',
        options: ({ asset }) => options(asset),
      },
    ),
  )(CustomFieldsSection),
);
