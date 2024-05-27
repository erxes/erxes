import * as compose from 'lodash.flowright';
import { gql, useMutation } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import GenerateCustomFields from '@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { FieldsGroupsQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { withProps } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';
import { InsuranceItem } from '../../../gql/types';
import queries from '../graphql';
import { filterFieldGroups } from '../../../utils';

type Props = {
  item: InsuranceItem;
  loading?: boolean;
  fieldsDataCallback?: (data: any) => void;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props;
// &
// AssetEditMutationResponse;

const CustomFieldsSection = (props: FinalProps) => {
  const { loading, item, fieldsGroupsQuery } = props;
  const [editMutation] = useMutation(queries.editMutation, options());

  if (fieldsGroupsQuery && fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = item;

  const save = (data, callback) => {
    editMutation({
      variables: { _id, doc: { customFieldsData: data } },
    })
      .then(() => {
        callback();
      })
      .catch((e) => {
        callback(e);
      });
  };

  const fieldsGroups = fieldsGroupsQuery.fieldsGroups || [];

  const filteredGroups = filterFieldGroups(
    fieldsGroups,
    item.product?.category?.code
  );

  if (props.fieldsDataCallback) {
    props.fieldsDataCallback(filteredGroups);
  }

  const collapseCallback = () => {};
  const updatedProps = {
    save,
    loading,
    customFieldsData: item?.customFieldsData || [],
    fieldsGroups:filteredGroups,
    isDetail: true,
    collapseCallback,
  };

  return <GenerateCustomFields {...updatedProps} />;
};

const options = () => ({
  refetchQueries: ['InsuranceItemByDealId'],
});

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(fieldQueries.fieldsGroups),
      {
        name: 'fieldsGroupsQuery',
        options: () => ({
          variables: {
            contentType: 'insurance:item',
            isDefinedByErxes: false,
          },
        }),
        skip: !isEnabled('forms'),
      }
    )
  )(CustomFieldsSection)
);
