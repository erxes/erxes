import {
  ContentColumn,
  ItemRow,
  ItemText
} from '@erxes/ui-cards/src/deals/styles';
import {
  ControlLabel,
  DataWithLoader,
  FormGroup,
  Pagination,
  router,
  SelectWithSearch,
  Spinner,
  Wrapper,
  __
} from '@erxes/ui/src';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';
import { queries as assetCategoryQueries } from '../asset/category/graphql';
import { queries as assetQueries } from '../asset/graphql';
import { ASSET_CATEGORY_STATUS_FILTER } from './constant';
import { CommonFormGroupTypes, IAsset, IAssetCategoryTypes } from './types';
import { queries as movementQueries } from '../movements/graphql';
import { queries as movementItemQueries } from '../movements/items/graphql';
import gql from 'graphql-tag';

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

export const CommonFormGroup = ({
  children,
  label,
  required
}: CommonFormGroupTypes) => {
  return (
    <FormGroup>
      <ControlLabel required={required}>{label}</ControlLabel>
      {children}
    </FormGroup>
  );
};

export const CommonItemRow = ({ children, label }) => {
  return (
    <ItemRow>
      <ItemText>{__(label)}</ItemText>
      <ContentColumn flex="4">{children}</ContentColumn>
    </ItemRow>
  );
};

export const generateCategoryOptions = (
  categories: IAssetCategoryTypes[],
  currentCategoryId?: string,
  drawCode?: boolean
) => {
  const result: React.ReactNode[] = [];

  for (const category of categories) {
    const order = category.order;

    const foundedString = order.match(/[/]/gi);

    let space = '';

    if (foundedString) {
      space = '\u00A0 '.repeat(foundedString.length);
    }

    if (currentCategoryId !== category._id) {
      result.push(
        <option key={category._id} value={category._id}>
          {space}
          {drawCode ? `${category.code} - ` : ''}
          {category.name}
        </option>
      );
    }
  }

  return result;
};

export const generateParentOptions = (
  assets: IAsset[],
  currentAssetId?: string,
  drawCode?: boolean
) => {
  const result: React.ReactNode[] = [];
  for (const asset of assets) {
    const order = asset.order;

    const foundedString = order.match(/[/]/gi);

    let space = '';

    if (foundedString) {
      space = '\u00A0 '.repeat(foundedString.length);
    }
    if (currentAssetId !== asset._id) {
      result.push(
        <option key={asset._id} value={asset._id}>
          {space}
          {drawCode ? `${asset.code} - ` : ''}
          {asset.name}
        </option>
      );
    }
  }
  return result;
};

export const assetStatusChoises = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(ASSET_CATEGORY_STATUS_FILTER)) {
    options.push({
      value: key,
      label: __(ASSET_CATEGORY_STATUS_FILTER[key])
    });
  }

  return options;
};

export const getRefetchQueries = () => {
  return [
    'assetDetail',
    'assets',
    'assetsTotalCount',
    'assetCategories',
    'assetMovementItems',
    'assetMovementItemsTotalCount'
  ];
};

export const movementRefetchQueries = queryParams => {
  return [
    {
      query: gql(movementQueries.movements),
      variables: {
        ...generateParams({ queryParams })
      }
    },
    {
      query: gql(movementQueries.movementsTotalCount),
      variables: {
        ...generateParams({ queryParams })
      }
    },
    {
      query: gql(movementQueries.movementDetail),
      variables: {
        ...generateParams({ queryParams })
      }
    },
    {
      query: gql(movementItemQueries.items),
      variables: {
        ...generateParams({ queryParams })
      }
    },
    {
      query: gql(movementItemQueries.itemsTotalCount),
      variables: {
        ...generateParams({ queryParams })
      }
    }
  ];
};

export const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  movementId: queryParams?.movementId,
  movedAtFrom: queryParams.movedAtFrom,
  movedAtTo: queryParams.movedAtTo,
  modifiedAtFrom: queryParams.modifiedAtFrom,
  modifiedAtTo: queryParams.modifiedAtTo,
  createdAtFrom: queryParams.createdAtFrom,
  createdAtTo: queryParams.createdAtTo,
  userId: queryParams.userId,
  branchId: queryParams?.branchId,
  departmentId: queryParams?.departmentId,
  teamMemberId: queryParams?.teamMemberId,
  companyId: queryParams?.companyId,
  customerId: queryParams?.customerId,
  assetId: queryParams?.assetId,
  parentId: queryParams?.parentId,
  searchValue: queryParams?.searchValue,
  onlyCurrent: !!queryParams?.onlyCurrent
});

export const SelectWithAssets = ({
  label,
  name,
  queryParams,
  initialValue,
  multi,
  customOption,
  onSelect,
  skip,
  additionalOptions
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  skip?: string[];
  additionalOptions?: IOption[];
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  const generateAssetOptions = (array: IAsset[] = []): IOption[] => {
    let list: any[] = [];

    for (const item of array) {
      const asset = item || ({} as IAsset);
      const order = asset.order;

      const foundedString = order.match(/[/]/gi);

      let space = '';

      if (foundedString) {
        space = '\u00A0 '.repeat(foundedString.length);
      }

      list.push({
        label: `${space} ${asset.code} - ${asset.name}`,
        value: asset._id
      });
    }
    if (skip) {
      list = list.filter(item => !skip.includes(item.value));
    }

    return list;
  };

  return (
    <SelectWithSearch
      label={label}
      queryName="assets"
      name={name}
      initialValue={defaultValue}
      generateOptions={generateAssetOptions}
      onSelect={onSelect}
      customQuery={assetQueries.assets}
      customOption={customOption}
      multi={multi}
    />
  );
};

export const SelectWithAssetCategory = ({
  label,
  name,
  queryParams,
  initialValue,
  multi,
  customOption,
  skip,
  onSelect
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  skip?: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  const generateAssetCategoryOptions = (array: IAsset[] = []): IOption[] => {
    let list: any[] = [];
    for (const item of array) {
      const asset = item || ({} as IAsset);
      const order = asset.order;

      const foundedString = order.match(/[/]/gi);

      let space = '';

      if (foundedString) {
        space = '\u00A0 '.repeat(foundedString.length);
      }

      list.push({ label: `${space} ${asset.name}`, value: asset._id });
    }

    if (skip) {
      list = list.filter(item => item.value !== skip);
    }
    return list;
  };

  return (
    <SelectWithSearch
      label={label}
      queryName="assetCategories"
      name={name}
      initialValue={defaultValue}
      generateOptions={generateAssetCategoryOptions}
      onSelect={onSelect}
      customQuery={assetCategoryQueries.assetCategory}
      customOption={customOption}
      multi={multi}
    />
  );
};
