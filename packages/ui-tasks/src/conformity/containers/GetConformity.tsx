import { gql, useQuery } from '@apollo/client';
import React from 'react';

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  mainTypeName?: string;
  relType?: string;
  component: any;
  queryName: string;
  itemsQuery: string;
  data?: any;
  collapseCallback?: () => void;
  alreadyItems?: any;
  actionSection?: any;
};

const PortableItemsContainer = (props: IProps) => {
  const {
    itemsQuery,
    component,
    queryName,
    mainType,
    mainTypeId,
    relType,
    alreadyItems,
  } = props;

  const variables: any = {
    mainType,
    mainTypeId,
    relType,
    limit: 40,
    isSaved: true,
  };

  // conformity with mainType "user" is not saved
  if (mainType === 'user') {
    variables.assignedUserIds = [mainTypeId];
    variables.isSaved = false;
  }

  // add archived items in contacts side bar
  if (mainType === 'customer' || mainType === 'company') {
    variables.noSkipArchive = true;
  }

  const { data, refetch } = useQuery(gql(itemsQuery), {
    skip: (!mainType && !mainTypeId && !relType) || alreadyItems !== undefined,
    variables,
  });

  let items = alreadyItems;

  if (!alreadyItems) {
    if (!data) {
      return null;
    }

    items = data[queryName] || [];
  }

  const onChangeItem = () => {
    refetch();
  };

  const extendedProps = {
    ...props,
    items,
    onChangeItem,
  };

  const Component = component;
  return <Component {...extendedProps} />;
};

export default PortableItemsContainer;
