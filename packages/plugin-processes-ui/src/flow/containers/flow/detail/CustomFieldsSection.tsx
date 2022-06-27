import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import GenerateCustomFields from '@erxes/ui-settings/src/properties/components/GenerateCustomFields';
import { FIELDS_GROUPS_CONTENT_TYPES } from '@erxes/ui-settings/src/properties/constants';
import { queries as fieldQueries } from '@erxes/ui-settings/src/properties/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import { FieldsGroupsQueryResponse } from '@erxes/ui-settings/src/properties/types';
import { mutations } from '../../../graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { EditMutationResponse, IProduct } from '@erxes/ui-products/src/types';

type Props = {
  product: IProduct;
  loading?: boolean;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props &
  EditMutationResponse;

const CustomFieldsSection = (props: FinalProps) => {
  const { loading, product, editMutation, fieldsGroupsQuery } = props;

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
    customFieldsData: product.customFieldsData,
    fieldsGroups: (fieldsGroupsQuery && fieldsGroupsQuery.fieldsGroups) || [],
    isDetail: true
  };

  return <GenerateCustomFields {...updatedProps} />;
};

const options = () => ({
  refetchQueries: ['companDetail']
});

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(fieldQueries.fieldsGroups),
      {
        name: 'fieldsGroupsQuery',
        options: () => ({
          variables: {
            contentType: FIELDS_GROUPS_CONTENT_TYPES.PRODUCT,
            isDefinedByErxes: false
          }
        }),
        skip: !isEnabled('forms') ? true : false
      }
    ),
    graphql<Props, EditMutationResponse, IProduct>(gql(mutations.productEdit), {
      name: 'editMutation',
      options
    })
  )(CustomFieldsSection)
);
