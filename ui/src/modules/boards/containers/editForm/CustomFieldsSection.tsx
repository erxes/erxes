import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import {
  IItem,
  IItemParams,
  IOptions,
  SaveMutation
} from 'modules/boards/types';
import Spinner from 'modules/common/components/Spinner';
import Sidebar from 'modules/layout/components/Sidebar';
import GenerateCustomFields from 'modules/settings/properties/components/GenerateCustomFields';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { renderWithProps } from '../../../common/utils';
import { FieldsGroupsQueryResponse } from '../../../settings/properties/types';

type Props = {
  item: IItem;
  options: IOptions;
  loading?: boolean;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
  editMutation: SaveMutation;
} & Props;

const CustomFieldsSection = (props: FinalProps) => {
  const { loading, item, fieldsGroupsQuery, editMutation } = props;

  if (fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = item;

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
    isDetail: false,
    customFieldsData: item.customFieldsData,
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || []
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default (props: Props) => {
  const { options } = props;

  return renderWithProps<Props>(
    props,
    compose(
      graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
        gql(fieldQueries.fieldsGroups),
        {
          name: 'fieldsGroupsQuery',
          options: () => ({
            variables: {
              contentType: options.type
            }
          })
        }
      ),
      graphql<Props, SaveMutation, IItemParams>(
        gql(options.mutations.editMutation),
        {
          name: 'editMutation'
        }
      )
    )(CustomFieldsSection)
  );
};
