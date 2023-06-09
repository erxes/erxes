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

import { mutations, queries } from '../../graphql';
import { DetailQueryResponse } from '../../types';

type Props = {
  isDetail: boolean;
  id: string;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
  carDetailQuery: DetailQueryResponse;
  editMutation: SaveMutation;
  id;
} & Props;

const CustomFieldsSection = (props: FinalProps) => {
  const {
    id,
    fieldsGroupsQuery,
    isDetail,
    carDetailQuery,
    editMutation
  } = props;

  if (
    fieldsGroupsQuery &&
    fieldsGroupsQuery.loading &&
    carDetailQuery &&
    carDetailQuery.loading
  ) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }
  const save = (data, callback) => {
    editMutation({
      variables: { _id: id, ...data }
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
    customFieldsData: carDetailQuery.carDetail.customFieldsData,
    fieldsGroups: fieldsGroupsQuery ? fieldsGroupsQuery.fieldsGroups : [],
    isDetail,
    object: carDetailQuery
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
            contentType: 'cars:car',
            isDefinedByErxes: false
          }
        }),
        skip: !isEnabled('forms') ? true : false
      }
    ),
    graphql<Props, DetailQueryResponse, { _id: string }>(
      gql(queries.carDetail),
      {
        name: 'carDetailQuery',
        options: ({ id }: any) => ({
          variables: {
            _id: id
          }
        })
      }
    ),
    graphql<Props, SaveMutation, IItemParams>(gql(mutations.carsEdit), {
      name: 'editMutation'
    })
  )(CustomFieldsSection)
);
