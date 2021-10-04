import React from 'react';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import Select from 'react-select-plus';
import { FormsQueryResponse } from 'modules/forms/types';

type Props = {
  formsQuery: FormsQueryResponse;
  onChange: () => void;
  value: string;
  placeholder: string;
};

function SelectProductCategory(props: Props) {
  const { formsQuery, onChange, value, placeholder } = props;

  if (formsQuery.loading) {
    return null;
  }
  const { forms } = formsQuery;

  return (
    <Select
      options={forms.map(el => ({
        label: el.title,
        value: el._id
      }))}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      clearable={false}
      backspaceRemoves={false}
    />
  );
}

export default compose(
  graphql<{}, FormsQueryResponse>(gql(queries.forms), {
    name: 'formsQuery'
  })
)(SelectProductCategory);
