import { AssetEditMutationResponse, IAsset } from '../../../common/types';

import GenerateCustomFields from '@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields';
import { FIELDS_GROUPS_CONTENT_TYPES } from '@erxes/ui-forms/src/settings/properties/constants';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { FieldsGroupsQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { gql, useQuery, useMutation } from '@apollo/client';
import React from 'react';
import { mutations } from '../../graphql';

type Props = {
  asset: IAsset;
  loading?: boolean;
};

const CustomFieldSectionContainer = (props: Props) => {
  const { loading, asset } = props;

  const fieldsGroupsQuery = useQuery<FieldsGroupsQueryResponse>(
    gql(fieldQueries.fieldsGroups),
    {
      variables: {
        contentType: FIELDS_GROUPS_CONTENT_TYPES.PRODUCT,
        isDefinedByErxes: false,
      },
    },
  );

  const [editMutation] = useMutation<AssetEditMutationResponse>(
    gql(mutations.assetEdit),
    {
      refetchQueries: ['assetDetailQuery'],
    },
  );

  if (fieldsGroupsQuery && fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const save = (data, callback) => {
    editMutation({
      variables: { _id: asset._id, ...data },
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
    fieldsGroups:
      (fieldsGroupsQuery && fieldsGroupsQuery?.data?.fieldsGroups) || [],
    isDetail: true,
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default CustomFieldSectionContainer;
