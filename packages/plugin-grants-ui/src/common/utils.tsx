import {
  DataWithLoader,
  Pagination,
  Spinner,
  Wrapper,
  __
} from '@erxes/ui/src';
import React from 'react';
import { queries } from '../section/graphql';
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

/** RefetchQueries */

export const refetchQueries = params => {
  return [
    {
      query: gql(queries.grantRequest),
      variables: { ...params }
    }
  ];
};

/** DefaultListWrapper */

export const DefaultWrapper = ({
  title,
  rightActionBar,
  leftActionBar,
  loading,
  totalCount,
  content,
  sidebar,
  isPaginationHide,
  breadcrumb,
  subMenu
}: {
  title: string;
  rightActionBar?: JSX.Element;
  leftActionBar?: JSX.Element;
  loading?: boolean;
  totalCount?: number;
  content: JSX.Element;
  sidebar?: JSX.Element;
  isPaginationHide?: boolean;
  breadcrumb?: any[];
  subMenu?: { title: string; link: string }[];
}) => {
  if (loading) {
    return <Spinner objective />;
  }
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={title}
          submenu={subMenu}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={
        <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />
      }
      content={
        <DataWithLoader
          loading={loading || false}
          data={content}
          count={totalCount}
          emptyImage="/images/actions/5.svg"
          emptyText={__('No data')}
        />
      }
      leftSidebar={sidebar}
      footer={!isPaginationHide && <Pagination count={totalCount} />}
    />
  );
};

export const generateTeamMemberParams = object => {
  const filter: any = {};

  if (!!object?.branchIds?.length) {
    filter.branchIds = object?.branchIds;
  }

  if (!!object?.departmentIds?.length) {
    filter.departmentIds = object?.departmentIds;
  }

  return filter;
};
