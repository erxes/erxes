import { EditMutationResponse, IProduct } from '../../../types';

import { FIELDS_GROUPS_CONTENT_TYPES } from '@erxes/ui-forms/src/settings/properties/constants';
import { FieldsGroupsQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import GenerateCustomFields from '@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Spinner from '@erxes/ui/src/components/Spinner';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { gql } from '@apollo/client';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { mutations } from '../../../graphql';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  product: IProduct;
  loading?: boolean;
};

const CustomFieldsSection = (props: Props) => {
  const { loading, product } = props;

  const fieldsGroupsQuery = useQuery<FieldsGroupsQueryResponse>(
    gql(fieldQueries.fieldsGroups),
    {
      variables: {
        contentType: FIELDS_GROUPS_CONTENT_TYPES.PRODUCT,
        isDefinedByErxes: false,
        config: { categoryId: product.categoryId },
      },
      skip: !isEnabled('forms'),
    },
  );

  const [editMutation] = useMutation<EditMutationResponse>(
    gql(mutations.productEdit),
    {
      refetchQueries: ['productDetail'],
    },
  );

  if (fieldsGroupsQuery && fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = product;

  const save = (data, callback) => {
    editMutation({
      variables: { _id, ...data },
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
    customFieldsData: product.customFieldsData,
    fieldsGroups:
      (fieldsGroupsQuery.data && fieldsGroupsQuery.data.fieldsGroups) || [],
    isDetail: true,
    collapseCallback: () => {},
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default CustomFieldsSection;
