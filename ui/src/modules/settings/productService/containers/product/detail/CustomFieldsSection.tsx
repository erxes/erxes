import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import Sidebar from 'modules/layout/components/Sidebar';
import {
  EditMutationResponse,
  IProduct
} from 'modules/settings/productService/types';
import GenerateCustomFields from 'modules/settings/properties/components/GenerateCustomFields';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../../../common/utils';
import { FieldsGroupsQueryResponse } from '../../../../../settings/properties/types';
import { mutations } from '../../../graphql';

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

  if (fieldsGroupsQuery.loading) {
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
    customFieldsData: product.customFieldsData || {},
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || [],
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
            contentType: FIELDS_GROUPS_CONTENT_TYPES.PRODUCT
          }
        })
      }
    ),
    graphql<Props, EditMutationResponse, IProduct>(gql(mutations.productEdit), {
      name: 'editMutation',
      options
    })
  )(CustomFieldsSection)
);
