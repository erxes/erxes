import { __ } from '@erxes/ui/src';
import React from 'react';
import { queries } from '../../section/graphql';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import Select from 'react-select-plus';

type Props = {
  label: string;
  onSelect: (value: string[] | string, name: string, scope: string) => void;
  initialValue?: string | string[];
  name: string;
};

class SelectActionsComponent extends React.Component<
  { grantActionsQuery: any } & Props
> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      label,
      initialValue,
      name,
      onSelect,
      grantActionsQuery
    } = this.props;

    const { loading, getGrantRequestActions } = grantActionsQuery;

    const list = getGrantRequestActions || [];

    const handleSelect = option => {
      const value = option?.value || '';
      const scope = list.find(item => item.action === value)?.scope || '';

      onSelect(value, name, scope);
    };

    return (
      <Select
        placeholder={__(label)}
        name={name}
        multi={false}
        onChange={handleSelect}
        value={initialValue}
        isLoading={loading}
        options={list.map(item => ({
          value: item.action,
          label: item.label
        }))}
      />
    );
  }
}

export const SelectActions = withProps<Props>(
  compose(
    graphql<Props>(gql(queries.grantActions), {
      name: 'grantActionsQuery'
      // options:({})
    })
  )(SelectActionsComponent)
);

export const refetchQueries = params => {
  return [
    {
      query: gql(queries.grantRequest),
      variables: { ...params }
    }
  ];
};
