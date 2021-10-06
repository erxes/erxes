import React from 'react';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import Select from 'react-select-plus';
import { FieldsGroupsQueryResponse } from 'modules/settings/properties/types';

type Props = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
  onChange: () => void;
  value: string;
  placeholder: string;
  multi: boolean;
};

function SelectFieldsGroup(props: Props) {
  const { fieldsGroupsQuery, onChange, value, placeholder, multi } = props;

  if (fieldsGroupsQuery.loading) {
    return null;
  }
  const { fieldsGroups } = fieldsGroupsQuery;

  return (
    <Select
      options={fieldsGroups.map(el => ({
        label: el.name,
        value: el._id,
        fields: el.fields
      }))}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      multi={multi || false}
    />
  );
}

export default compose(
  graphql<{}, FieldsGroupsQueryResponse>(gql(queries.fieldsGroups), {
    name: 'fieldsGroupsQuery',
    options: () => ({
      variables: {
        contentType: 'product'
      }
    })
  })
)(SelectFieldsGroup);
