import { IItemParams, SaveMutation } from '@erxes/ui-cards/src/boards/types';
import GenerateCustomFields from '@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { FieldsGroupsQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { withProps } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { queries, mutations } from '../graphql';

type Props = {
  isDetail: boolean;
  _id: string;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
  productDetailQuery: any;
  editMutation: SaveMutation;
  id;
} & Props;

const CustomFieldsSection = (props: FinalProps) => {
  const {
    _id,
    fieldsGroupsQuery,
    isDetail,
    productDetailQuery,
    editMutation
  } = props;

  if (
    fieldsGroupsQuery &&
    fieldsGroupsQuery.loading &&
    productDetailQuery &&
    productDetailQuery.loading
  ) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }
  const save = (data, callback) => {
    editMutation({
      variables: { _id, ...data }
    })
      .then(() => {
        productDetailQuery.refetch();
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const updatedProps = {
    save,
    customFieldsData:
      (productDetailQuery &&
        productDetailQuery.insuranceProduct.customFieldsData) ||
      [],
    fieldsGroups: fieldsGroupsQuery ? fieldsGroupsQuery.fieldsGroups : [],
    isDetail,
    object: productDetailQuery.insuranceProduct
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
            contentType: 'insurance:product',
            isDefinedByErxes: false
          }
        }),
        skip: !isEnabled('forms') ? true : false
      }
    ),
    graphql<Props, any, { _id: string }>(queries.GET_PRODUCT, {
      name: 'productDetailQuery',
      options: ({ _id }: any) => ({
        variables: {
          _id
        }
      })
    }),
    graphql<Props, SaveMutation, IItemParams>(mutations.PRODUCTS_EDIT, {
      name: 'editMutation'
    })
  )(CustomFieldsSection)
);
