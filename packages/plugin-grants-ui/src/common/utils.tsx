import {
  DataWithLoader,
  Pagination,
  Spinner,
  Wrapper,
  __,
} from "@erxes/ui/src";
import React from "react";
import { queries } from "../section/graphql";
import { gql } from "@apollo/client";
import Select from "react-select";
import { useQuery } from "@apollo/client";

type Props = {
  label: string;
  onSelect: (value: string[] | string, name: string, scope: string) => void;
  initialValue?: string | string[];
  name: string;
};

const SelectActionsComponent: React.FC<Props> = (props) => {
  const { label, initialValue, name, onSelect } = props;

  const grantActionsQuery = useQuery(gql(queries.grantActions));

  const { loading } = grantActionsQuery;

  const list =
    (grantActionsQuery.data && grantActionsQuery.data.getGrantRequestActions) ||
    [];

  const handleSelect = (option) => {
    const value = option?.value || "";
    const scope = list.find((item) => item.action === value)?.scope || "";

    onSelect(value, name, scope);
  };

  const options = list.map((item) => ({
    value: item.action,
    label: item.label,
  }));

  return (
    <Select
      placeholder={__(label)}
      name={name}
      isMulti={false}
      onChange={handleSelect}
      value={options.find((o) => o.value === initialValue)}
      isClearable={true}
      isLoading={loading}
      options={options}
    />
  );
};

export const SelectActions = SelectActionsComponent;

/** RefetchQueries */

export const refetchQueries = (params) => {
  return [
    {
      query: gql(queries.grantRequest),
      variables: { ...params },
    },
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
  subMenu,
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
          emptyText={__("No data")}
        />
      }
      leftSidebar={sidebar}
      footer={!isPaginationHide && <Pagination count={totalCount} />}
    />
  );
};

export const generateTeamMemberParams = (object) => {
  const filter: any = {};

  if (!!object?.branchIds?.length) {
    filter.branchIds = object?.branchIds;
  }

  if (!!object?.departmentIds?.length) {
    filter.departmentIds = object?.departmentIds;
  }

  return filter;
};
